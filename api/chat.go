package api

import (
	"chat/auth"
	"chat/conversation"
	"chat/middleware"
	"chat/utils"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
)

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
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

	instance := conversation.NewConversation(user.Username, user.ID)

	for {
		_, message, err = conn.ReadMessage()
		if err != nil {
			return
		}
		if msg, err := instance.AddMessageFromUserForm(message); err == nil {
			StreamRequest("gpt-3.5-turbo", ChatWithWeb(instance.GetMessageSegment(5), msg), 1500, func(resp string) {
				data, _ := json.Marshal(map[string]interface{}{
					"message": resp,
					"end":     false,
				})
				_ = conn.WriteMessage(websocket.TextMessage, data)
			})
			data, _ := json.Marshal(map[string]interface{}{
				"message": "",
				"end":     true,
			})
			_ = conn.WriteMessage(websocket.TextMessage, data)
		}
	}
}
