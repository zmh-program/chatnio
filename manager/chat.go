package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/auth"
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
)

const defaultMessage = "Sorry, I don't understand. Please try again."
const defaultQuotaMessage = "You don't have enough quota to use this model. see [pricing](https://docs.chatnio.net/ai-mo-xing-ji-ji-fei) for more information."

func GetErrorQuota(model string) float32 {
	return utils.Multi[float32](globals.IsGPT4Model(model), -0xe, 0) // special value for error
}

func CollectQuota(c *gin.Context, user *auth.User, quota float32, reversible bool) {
	db := utils.GetDBFromContext(c)
	if !reversible && quota > 0 && user != nil {
		user.UseQuota(db, quota)
	}
}

func ChatHandler(conn *utils.WebSocket, user *auth.User, instance *conversation.Conversation) string {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)",
				err, instance.GetModel(), conn.GetCtx().ClientIP(),
			))
		}
	}()

	keyword, segment := web.UsingWebSegment(instance)
	conn.Send(globals.ChatSegmentResponse{Keyword: keyword, End: false})

	model := instance.GetModel()
	db := conn.GetDB()
	cache := conn.GetCache()
	reversible := globals.IsGPT4NativeModel(model) && auth.CanEnableSubscription(db, cache, user)

	if !auth.CanEnableModelWithSubscription(db, user, model, reversible) {
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
		Reversible: reversible,
	}); form != nil {
		conn.Send(globals.ChatSegmentResponse{
			Message: form.Message,
			Quota:   0,
			End:     true,
		})
		return form.Message
	}

	buffer := utils.NewBuffer(model, segment)
	if err := adapter.NewChatRequest(&adapter.ChatProps{
		Model:      model,
		Message:    segment,
		Reversible: reversible && globals.IsGPT4Model(model),
	}, func(data string) error {
		return conn.SendJSON(globals.ChatSegmentResponse{
			Message: buffer.Write(data),
			Quota:   buffer.GetQuota(),
			End:     false,
		})
	}); err != nil {
		CollectQuota(conn.GetCtx(), user, buffer.GetQuota(), reversible)
		conn.Send(globals.ChatSegmentResponse{
			Message: err.Error(),
			Quota:   GetErrorQuota(model),
			End:     true,
		})
		return err.Error()
	}

	CollectQuota(conn.GetCtx(), user, buffer.GetQuota(), reversible)

	if buffer.IsEmpty() {
		conn.Send(globals.ChatSegmentResponse{
			Message: defaultMessage,
			Quota:   GetErrorQuota(model),
			End:     true,
		})
		return defaultMessage
	}

	conn.Send(globals.ChatSegmentResponse{End: true, Quota: buffer.GetQuota()})

	SaveCacheData(conn.GetCtx(), &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: reversible,
	}, &CacheData{
		Keyword: keyword,
		Message: buffer.ReadWithDefault(defaultMessage),
	})

	return buffer.ReadWithDefault(defaultMessage)
}
