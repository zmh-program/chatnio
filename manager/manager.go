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
}

func EventHandler(conn *utils.WebSocket, instance *conversation.Conversation, user *auth.User) string {
	if strings.HasPrefix(instance.GetLatestMessage(), "/image") {
		if user == nil {
			conn.Send(globals.ChatSegmentResponse{
				Message: "You need to login to use this feature.",
				End:     true,
			})
			return "You need to login to use this feature."
		}

		prompt := strings.TrimSpace(strings.TrimPrefix(instance.GetLatestMessage(), "/image"))

		if response, err := GenerateImage(conn.GetCtx(), user, prompt); err != nil {
			conn.Send(globals.ChatSegmentResponse{
				Message: err.Error(),
				End:     true,
			})
			return err.Error()
		} else {
			conn.Send(globals.ChatSegmentResponse{
				Quota:   1.,
				Message: response,
				End:     true,
			})
			return response
		}
	} else {
		return ChatHandler(conn, user, instance)
	}
}

func ChatAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c); conn == nil {
		return
	}
	defer conn.DeferClose()

	db := utils.GetDBFromContext(c)

	var form *WebsocketAuthForm
	if form = utils.ReadForm[WebsocketAuthForm](conn); form == nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	authenticated := user != nil

	id := auth.GetId(db, user)

	instance := conversation.ExtractConversation(db, user, id)
	hash := fmt.Sprintf(":chatthread:%s", utils.Md5Encrypt(utils.Multi(
		authenticated,
		strconv.FormatInt(id, 10),
		c.ClientIP(),
	)))

	for {
		var form *conversation.FormMessage
		if form := utils.ReadForm[conversation.FormMessage](conn); form == nil {
			return
		}

		if instance.HandleMessage(db, form) {
			if !conn.IncrRateWithLimit(
				hash,
				utils.Multi[int64](authenticated, globals.ChatMaxThread, globals.AnonymousMaxThread),
				60,
			) {
				conn.Send(globals.ChatSegmentResponse{
					Message: fmt.Sprintf("You have reached the maximum number of threads (%d) the same time. Please wait for a while.", globals.ChatMaxThread),
					End:     true,
				})
				return
			}

			response := EventHandler(conn, instance, user)
			conn.DecrRate(hash)
			instance.SaveResponse(db, response)
		}
	}
}
