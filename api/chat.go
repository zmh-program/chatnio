package api

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
)

func ChatAPI(c *gin.Context) {
	// websocket connection
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
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
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			return
		}

		var form map[string]interface{}
		if err := json.Unmarshal(message, &form); err == nil {
			message := form["message"].(string)
			StreamRequest("gpt-3.5-turbo-16k", []ChatGPTMessage{
				{
					Role:    "user",
					Content: message,
				},
			}, 250, func(resp string) {
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
