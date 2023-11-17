package manager

import (
	"chat/auth"
	"chat/globals"
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

func ParseAuth(c *gin.Context, token string) *auth.User {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil
	}

	if strings.HasPrefix(token, "Bearer ") {
		token = token[7:]
	}

	if strings.HasPrefix(token, "sk-") {
		return auth.ParseApiKey(c, token)
	}

	return auth.ParseToken(c, token)
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

	user := ParseAuth(c, form.Token)
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
				response := ChatHandler(buf, user, instance)
				instance.SaveResponse(db, response)
			}
		case StopType:
			break
		case ShareType:
			instance.LoadSharing(db, form.Message)
		case RestartType:
			if message := instance.RemoveLatestMessage(); message.Role != globals.Assistant {
				conn.Send(globals.ChatSegmentResponse{
					Message: "Hello, How can I assist you?",
					End:     true,
				})
				return fmt.Errorf("message type error")
			}

			response := ChatHandler(buf, user, instance)
			instance.SaveResponse(db, response)
		case MaskType:
			instance.LoadMask(form.Message)
		}

		return nil
	})
}
