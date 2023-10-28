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
			globals.Warn(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)",
				err, model, c.ClientIP(),
			))
		}
	}()

	keyword, segment := web.UsingWebNativeSegment(enableWeb, message)

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, model)

	if !check {
		return keyword, defaultQuotaMessage, 0
	}

	if form := ExtractCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}); form != nil {
		return form.Keyword, form.Message, 0
	}

	buffer := utils.NewBuffer(model, segment)
	if err := adapter.NewChatRequest(&adapter.ChatProps{
		Model:      model,
		Reversible: plan,
		Message:    segment,
	}, func(resp string) error {
		buffer.Write(resp)
		return nil
	}); err != nil {
		CollectQuota(c, user, buffer, plan)
		return keyword, err.Error(), GetErrorQuota(model)
	}

	CollectQuota(c, user, buffer, plan)

	SaveCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}, &CacheData{
		Keyword: keyword,
		Message: buffer.ReadWithDefault(defaultMessage),
	})

	return keyword, buffer.ReadWithDefault(defaultMessage), buffer.GetQuota()
}
