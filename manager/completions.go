package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
)

func NativeChatHandler(c *gin.Context, user *auth.User, model string, message []globals.Message, enableWeb bool) (string, string, float32) {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)",
				err, model, c.ClientIP(),
			))
		}
	}()

	keyword, segment := web.UsingWebNativeSegment(enableWeb, message)

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	reversible := globals.IsGPT4NativeModel(model) && auth.CanEnableSubscription(db, cache, user)

	if !auth.CanEnableModelWithSubscription(db, user, model, reversible) {
		return keyword, defaultQuotaMessage, 0
	}

	if form := ExtractCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: reversible,
	}); form != nil {
		return form.Keyword, form.Message, 0
	}

	buffer := utils.NewBuffer(model, segment)
	if err := adapter.NewChatRequest(&adapter.ChatProps{
		Model:      model,
		Reversible: reversible && globals.IsGPT4Model(model),
		Message:    segment,
	}, func(resp string) error {
		buffer.Write(resp)
		return nil
	}); err != nil {
		CollectQuota(c, user, buffer.GetQuota(), reversible)
		return keyword, err.Error(), GetErrorQuota(model)
	}

	CollectQuota(c, user, buffer.GetQuota(), reversible)

	SaveCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: reversible,
	}, &CacheData{
		Keyword: keyword,
		Message: buffer.ReadWithDefault(defaultMessage),
	})

	return keyword, buffer.ReadWithDefault(defaultMessage), buffer.GetQuota()
}
