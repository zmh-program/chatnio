package manager

import (
	"chat/adapter"
	"chat/adapter/common"
	"chat/addition/web"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"fmt"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

const defaultMessage = "empty response"

func CollectQuota(c *gin.Context, user *auth.User, buffer *utils.Buffer, uncountable bool, err error) {
	db := utils.GetDBFromContext(c)
	quota := buffer.GetQuota()

	if user == nil || quota <= 0 {
		return
	}

	if buffer.IsEmpty() || err != nil {
		return
	}

	if !uncountable {
		user.UseQuota(db, quota)
	}
}

func ChatHandler(conn *Connection, user *auth.User, instance *conversation.Conversation, restart bool) string {
	defer func() {
		if err := recover(); err != nil {
			stack := debug.Stack()
			globals.Warn(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)\n%s",
				err, instance.GetModel(), conn.GetCtx().ClientIP(), stack,
			))
		}
	}()

	db := conn.GetDB()
	cache := conn.GetCache()

	model := instance.GetModel()
	segment := adapter.ClearMessages(model, web.UsingWebSegment(instance, restart))

	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, model)
	conn.Send(globals.ChatSegmentResponse{
		Conversation: instance.GetId(),
	})

	if check != nil {
		message := check.Error()
		conn.Send(globals.ChatSegmentResponse{
			Message: message,
			Quota:   0,
			End:     true,
		})
		return message
	}

	buffer := utils.NewBuffer(model, segment, channel.ChargeInstance.GetCharge(model))
	hit, err := channel.NewChatRequestWithCache(
		cache, buffer,
		auth.GetGroup(db, user),
		&adaptercommon.ChatProps{
			Model:             model,
			Message:           segment,
			Buffer:            *buffer,
			MaxTokens:         instance.GetMaxTokens(),
			Temperature:       instance.GetTemperature(),
			TopP:              instance.GetTopP(),
			TopK:              instance.GetTopK(),
			PresencePenalty:   instance.GetPresencePenalty(),
			FrequencyPenalty:  instance.GetFrequencyPenalty(),
			RepetitionPenalty: instance.GetRepetitionPenalty(),
		},
		func(data *globals.Chunk) error {
			if signal := conn.PeekStop(); signal != nil {
				// stop signal from client
				return fmt.Errorf("signal")
			}
			return conn.SendClient(globals.ChatSegmentResponse{
				Message: buffer.WriteChunk(data),
				Quota:   buffer.GetQuota(),
				End:     false,
				Plan:    plan,
			})
		},
	)

	admin.AnalysisRequest(model, buffer, err)
	if adapter.IsAvailableError(err) {
		globals.Warn(fmt.Sprintf("%s (model: %s, client: %s)", err, model, conn.GetCtx().ClientIP()))

		auth.RevertSubscriptionUsage(db, cache, user, model)
		conn.Send(globals.ChatSegmentResponse{
			Message: err.Error(),
			End:     true,
		})
		return err.Error()
	}

	if !hit {
		CollectQuota(conn.GetCtx(), user, buffer, plan, err)
	}

	if buffer.IsEmpty() {
		conn.Send(globals.ChatSegmentResponse{
			Message: defaultMessage,
			End:     true,
		})
		return defaultMessage
	}

	conn.Send(globals.ChatSegmentResponse{
		End:   true,
		Quota: buffer.GetQuota(),
		Plan:  plan,
	})

	return buffer.ReadWithDefault(defaultMessage)
}
