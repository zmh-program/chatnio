package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"time"
)

const defaultMessage = "Sorry, I don't understand. Please try again."
const defaultQuotaMessage = "You don't have enough quota or you don't have permission to use this model. please [buy](/buy) or [subscribe](/subscribe) to get more."

func CollectQuota(c *gin.Context, user *auth.User, buffer *utils.Buffer, uncountable bool, err error) {
	db := utils.GetDBFromContext(c)
	quota := buffer.GetQuota()
	if buffer.IsEmpty() {
		return
	} else if buffer.GetCharge().IsBillingType(globals.TimesBilling) && err != nil {
		// billing type is times, but error occurred
		return
	}

	// collect quota for tokens billing (though error occurred) or times billing
	if !uncountable && quota > 0 && user != nil {
		user.UseQuota(db, quota)
	}
}

func MockStreamSender(conn *Connection, message string) {
	for _, line := range utils.SplitLangItems(message) {
		time.Sleep(100 * time.Millisecond)
		conn.Send(globals.ChatSegmentResponse{
			Message: line + " ",
			End:     false,
			Quota:   0,
		})

		if signal := conn.PeekWithType(StopType); signal != nil {
			// stop signal from client
			break
		}
	}

	conn.Send(globals.ChatSegmentResponse{
		End:   true,
		Quota: 0,
	})
}

func ChatHandler(conn *Connection, user *auth.User, instance *conversation.Conversation) string {
	defer func() {
		if err := recover(); err != nil {
			globals.Warn(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)",
				err, instance.GetModel(), conn.GetCtx().ClientIP(),
			))
		}
	}()

	segment := web.UsingWebSegment(instance)

	model := instance.GetModel()
	db := conn.GetDB()
	cache := conn.GetCache()
	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, model)
	conn.Send(globals.ChatSegmentResponse{
		Conversation: instance.GetId(),
	})

	if !check {
		conn.Send(globals.ChatSegmentResponse{
			Message: defaultQuotaMessage,
			Quota:   0,
			End:     true,
		})
		return defaultQuotaMessage
	}

	if form := ExtractCacheData(conn.GetCtx(), &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}); form != nil {
		MockStreamSender(conn, form.Message)
		return form.Message
	}

	buffer := utils.NewBuffer(model, segment, channel.ChargeInstance.GetCharge(model))
	err := channel.NewChatRequest(
		auth.GetGroup(db, user),
		&adapter.ChatProps{
			Model:   model,
			Message: segment,
			Plan:    plan,
			Buffer:  *buffer,
		},
		func(data string) error {
			if signal := conn.PeekWithType(StopType); signal != nil {
				// stop signal from client
				return fmt.Errorf("signal")
			}
			return conn.SendClient(globals.ChatSegmentResponse{
				Message: buffer.Write(data),
				Quota:   buffer.GetQuota(),
				End:     false,
				Plan:    plan,
			})
		},
	)

	admin.AnalysisRequest(model, buffer, err)
	if err != nil && err.Error() != "signal" {
		globals.Warn(fmt.Sprintf("caught error from chat handler: %s (instance: %s, client: %s)", err, model, conn.GetCtx().ClientIP()))

		auth.RevertSubscriptionUsage(db, cache, user, model)
		CollectQuota(conn.GetCtx(), user, buffer, plan, err)
		conn.Send(globals.ChatSegmentResponse{
			Message: err.Error(),
			End:     true,
		})
		return err.Error()
	}

	CollectQuota(conn.GetCtx(), user, buffer, plan, err)

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

	result := buffer.ReadWithDefault(defaultMessage)

	if err == nil && result != defaultMessage {
		SaveCacheData(conn.GetCtx(), &CacheProps{
			Message:    segment,
			Model:      model,
			Reversible: plan,
		}, &CacheData{
			Message: result,
		})
	}

	return result
}
