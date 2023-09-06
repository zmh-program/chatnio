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

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
	Id    int64  `json:"id" binding:"required"`
}

func SendSegmentMessage(conn *websocket.Conn, message types.ChatGPTSegmentResponse) {
	_ = conn.WriteMessage(websocket.TextMessage, []byte(utils.ToJson(message)))
}

func TextChat(db *sql.DB, user *auth.User, conn *websocket.Conn, instance *conversation.Conversation) string {
	keyword, segment := ChatWithWeb(conversation.CopyMessage(instance.GetMessageSegment(12)), true)
	SendSegmentMessage(conn, types.ChatGPTSegmentResponse{Keyword: keyword, End: false})

	msg := ""

	if instance.IsEnableGPT4() && !auth.ReduceGPT4(db, user) {
		SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
			Message: "You have run out of GPT-4 usage. Please buy more.",
			End:     true,
		})
		return "You have run out of GPT-4 usage. Please buy more."
	}

	StreamRequest(instance.IsEnableGPT4(), segment, 2000, func(resp string) {
		msg += resp
		SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
			Message: resp,
			End:     false,
		})
	})
	if msg == "" {
		msg = "There was something wrong... Please try again later."
		if instance.IsEnableGPT4() {
			auth.IncreaseGPT4(db, user, 1)
		}
		SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
			Message: msg,
			End:     false,
		})
	}
	SendSegmentMessage(conn, types.ChatGPTSegmentResponse{End: true})

	return msg
}

func ImageChat(conn *websocket.Conn, instance *conversation.Conversation, user *auth.User, db *sql.DB, cache *redis.Client) string {
	// format: /image a cat
	data := strings.TrimSpace(instance.GetLatestMessage()[6:])
	if len(data) == 0 {
		SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
			Message: "Please provide description for the image.",
			End:     true,
		})
		return "Please provide description for the image."
	}

	SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
		Message: "Generating image...\n",
		End:     false,
	})
	url, err := GetImageWithUserLimit(user, data, db, cache)
	if err != nil {
		SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
			Message: err.Error(),
			End:     true,
		})
		return err.Error()
	}

	markdown := fmt.Sprintln("![image](", url, ")")
	SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
		Message: markdown,
		Keyword: "image",
		End:     true,
	})
	return markdown
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

	for {
		_, message, err = conn.ReadMessage()
		if err != nil {
			return
		}
		if instance.HandleMessage(db, message) {
			var msg string
			if strings.HasPrefix(instance.GetLatestMessage(), "/image") {
				cache := c.MustGet("cache").(*redis.Client)
				msg = ImageChat(conn, instance, user, db, cache)
			} else {
				msg = TextChat(db, user, conn, instance)
			}
			instance.SaveResponse(db, msg)
		}
	}
}
