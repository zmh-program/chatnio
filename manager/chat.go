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
	"strings"
	"time"
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

func ImageHandler(conn *Connection, user *auth.User, instance *conversation.Conversation) string {
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
		MockStreamSender(conn, form.Message)
		return form.Message
	}

	buffer := utils.NewBuffer(model, segment)
	err := adapter.NewChatRequest(&adapter.ChatProps{
		Model:      model,
		Message:    segment,
		Reversible: reversible && globals.IsGPT4Model(model),
	}, func(data string) error {
		if signal := conn.PeekWithType(StopType); signal != nil {
			// stop signal from client
			return fmt.Errorf("signal")
		}
		return conn.SendClient(globals.ChatSegmentResponse{
			Message: buffer.Write(data),
			Quota:   buffer.GetQuota(),
			End:     false,
		})
	})

	if err != nil && err.Error() != "signal" {
		fmt.Println(fmt.Sprintf("caught error from chat handler: %s (instance: %s, client: %s)", err, model, conn.GetCtx().ClientIP()))

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

	result := buffer.ReadWithDefault(defaultMessage)

	if err == nil && result != defaultMessage {
		SaveCacheData(conn.GetCtx(), &CacheProps{
			Message:    segment,
			Model:      model,
			Reversible: reversible,
		}, &CacheData{
			Keyword: keyword,
			Message: result,
		})
	}

	return result
}
