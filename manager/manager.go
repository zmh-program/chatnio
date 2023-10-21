package manager

import (
	"chat/auth"
	"chat/manager/conversation"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strconv"
	"strings"
)

type WebsocketAuthForm struct {
	Token string `json:"token" binding:"required"`
	Id    int64  `json:"id" binding:"required"`
	Ref   string `json:"ref"`
}

func EventHandler(conn *Connection, instance *conversation.Conversation, user *auth.User) string {
	if strings.HasPrefix(instance.GetLatestMessage(), "/image") {
		return ImageHandler(conn, user, instance)
	} else {
		return ChatHandler(conn, user, instance)
	}
}

func ChatAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c, false); conn == nil {
		return
	}

	db := utils.GetDBFromContext(c)

	var form *WebsocketAuthForm
	if form = utils.ReadForm[WebsocketAuthForm](conn); form == nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	authenticated := user != nil

	id := auth.GetId(db, user)

	instance := conversation.ExtractConversation(db, user, form.Id, form.Ref)
	hash := fmt.Sprintf(":chatthread:%s", utils.Md5Encrypt(utils.Multi(
		authenticated,
		strconv.FormatInt(id, 10),
		c.ClientIP(),
	)))

	buf := NewConnection(conn, authenticated, hash, 10)
	buf.Handle(func(form *conversation.FormMessage) error {
		switch form.Type {
		case ChatType:
			if instance.HandleMessage(db, form) {
				response := EventHandler(buf, instance, user)
				instance.SaveResponse(db, response)
			}
		case StopType:
			break
		case ShareType:
			instance.LoadSharing(db, form.Message)
		case RestartType:
			if message := instance.RemoveLatestMessage(); message.Role != "user" {
				return fmt.Errorf("message type error")
			}
			response := EventHandler(buf, instance, user)
			instance.SaveResponse(db, response)
		}

		return nil
	})
}
