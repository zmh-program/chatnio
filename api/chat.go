package api

import (
	"chat/auth"
	"chat/conversation"
	"chat/middleware"
	"chat/types"
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"net/http"
	"strings"
)

const defaultErrorMessage = "There was something wrong... Please try again later."
const defaultQuotaMessage = "You have run out of GPT-4 usage. Please keep your nio points above **5**. (**GPT-4-32K** requires **50** nio points)"
const defaultImageMessage = "Please provide description for the image (e.g. /image an apple)."
const maxThread = 5

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
	Id    int64  `json:"id" binding:"required"`
}

func SendSegmentMessage(conn *websocket.Conn, message interface{}) {
	_ = conn.WriteMessage(websocket.TextMessage, []byte(utils.ToJson(message)))
}

func GetErrorQuota(model string) float32 {
	if types.IsGPT4Model(model) {
		return -0xe // special value for error
	} else {
		return 0
	}
}

func GetTextSegment(instance *conversation.Conversation) (string, []types.ChatGPTMessage) {
	var keyword string
	var segment []types.ChatGPTMessage

	if instance.IsEnableWeb() {
		keyword, segment = ChatWithWeb(conversation.CopyMessage(instance.GetMessageSegment(12)), true)
	} else {
		segment = conversation.CopyMessage(instance.GetMessageSegment(12))
	}
	return keyword, segment
}

func TextChat(db *sql.DB, cache *redis.Client, user *auth.User, conn *websocket.Conn, instance *conversation.Conversation) string {
	keyword, segment := GetTextSegment(instance)
	SendSegmentMessage(conn, types.ChatSegmentResponse{Keyword: keyword, End: false})

	model := instance.GetModel()
	useReverse := auth.CanEnableSubscription(db, cache, user)
	if !auth.CanEnableModelWithSubscription(db, user, model, useReverse) {
		SendSegmentMessage(conn, types.ChatSegmentResponse{
			Message: defaultQuotaMessage,
			Quota:   0,
			End:     true,
		})
		return defaultQuotaMessage
	}

	buffer := NewBuffer(model, segment)
	StreamRequest(model, useReverse, segment,
		utils.Multi(types.IsGPT4Model(model) || useReverse, -1, 2000),
		func(resp string) {
			SendSegmentMessage(conn, types.ChatSegmentResponse{
				Message: buffer.Write(resp),
				Quota:   buffer.GetQuota(),
				End:     false,
			})
		})
	if buffer.IsEmpty() {
		if useReverse {
			auth.DecreaseSubscriptionUsage(cache, user)
		}
		SendSegmentMessage(conn, types.ChatSegmentResponse{
			Message: defaultErrorMessage,
			Quota:   GetErrorQuota(model),
			End:     true,
		})
		return defaultErrorMessage
	}

	// collect quota
	if !useReverse {
		user.UseQuota(db, buffer.GetQuota())
	}
	SendSegmentMessage(conn, types.ChatSegmentResponse{End: true, Quota: buffer.GetQuota()})

	return buffer.ReadWithDefault(defaultErrorMessage)
}

func ImageChat(conn *websocket.Conn, instance *conversation.Conversation, user *auth.User, db *sql.DB, cache *redis.Client) string {
	// format: /image a cat
	data := strings.TrimSpace(instance.GetLatestMessage()[6:])
	if len(data) == 0 {
		SendSegmentMessage(conn, types.ChatSegmentResponse{
			Message: defaultImageMessage,
			End:     true,
		})
		return defaultImageMessage
	}

	SendSegmentMessage(conn, types.ChatSegmentResponse{
		Message: "Generating image...\n",
		End:     false,
	})
	url, err := GetImageWithUserLimit(user, data, db, cache)
	if err != nil {
		SendSegmentMessage(conn, types.ChatSegmentResponse{
			Message: err.Error(),
			End:     true,
		})
		return err.Error()
	}

	markdown := GetImageMarkdown(url)
	SendSegmentMessage(conn, types.ChatSegmentResponse{
		Quota:   1.,
		Message: markdown,
		End:     true,
	})
	return markdown
}

func ChatHandler(conn *websocket.Conn, instance *conversation.Conversation, user *auth.User, db *sql.DB, cache *redis.Client) string {
	if strings.HasPrefix(instance.GetLatestMessage(), "/image") {
		return ImageChat(conn, instance, user, db, cache)
	} else {
		return TextChat(db, cache, user, conn, instance)
	}
}

func ChatAPI(c *gin.Context) {
	// websocket connection
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := c.Request.Header.Get("Origin")
			if utils.Contains(origin, middleware.AllowedOrigins) {
				return true
			}
			return false
		},
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  err.Error(),
		})
		return
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
			return
		}
	}(conn)

	_, message, err := conn.ReadMessage()
	if err != nil {
		return
	}
	form, err := utils.Unmarshal[WebsocketAuthForm](message)
	if err != nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	if user == nil {
		return
	}

	db := c.MustGet("db").(*sql.DB)
	cache := c.MustGet("cache").(*redis.Client)
	var instance *conversation.Conversation
	if form.Id == -1 {
		// create new conversation
		instance = conversation.NewConversation(db, user.GetID(db))
	} else {
		// load conversation
		instance = conversation.LoadConversation(db, user.GetID(db), form.Id)
		if instance == nil {
			instance = conversation.NewConversation(db, user.GetID(db))
		}
	}

	id := user.GetID(db)

	for {
		_, message, err = conn.ReadMessage()
		if err != nil {
			return
		}
		if instance.HandleMessage(db, message) {
			if !utils.IncrWithLimit(cache, fmt.Sprintf(":chatthread:%d", id), 1, maxThread, 60) {
				SendSegmentMessage(conn, types.ChatSegmentResponse{
					Message: fmt.Sprintf("You have reached the maximum number of threads (%d) the same time. Please wait for a while.", maxThread),
					End:     true,
				})
				return
			}
			msg := ChatHandler(conn, instance, user, db, cache)
			utils.DecrInt(cache, fmt.Sprintf(":chatthread:%d", id), 1)
			instance.SaveResponse(db, msg)
		}
	}
}
