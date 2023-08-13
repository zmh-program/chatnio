package api

import (
	"chat/auth"
	"chat/conversation"
	"chat/middleware"
	"chat/types"
	"chat/utils"
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
)

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
}

func SendSegmentMessage(conn *websocket.Conn, message types.ChatGPTSegmentResponse) {
	_ = conn.WriteMessage(websocket.TextMessage, []byte(utils.ToJson(message)))
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
	instance := conversation.NewConversation(db, user.GetID(db))

	for {
		_, message, err = conn.ReadMessage()
		if err != nil {
			return
		}
		if instance.HandleMessage(db, message) {
			keyword, segment := ChatWithWeb(instance.GetMessageSegment(12), true)
			SendSegmentMessage(conn, types.ChatGPTSegmentResponse{Keyword: keyword, End: false})

			msg := ""
			StreamRequest("gpt-3.5-turbo-16k-0613", segment, 2000, func(resp string) {
				msg += resp
				SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
					Message: resp,
					End:     false,
				})
			})
			if msg == "" {
				msg = "There was something wrong... Please try again later."
				SendSegmentMessage(conn, types.ChatGPTSegmentResponse{
					Message: msg,
					End:     false,
				})
			}

			instance.SaveResponse(db, msg)
			SendSegmentMessage(conn, types.ChatGPTSegmentResponse{End: true})
		}
	}
}
