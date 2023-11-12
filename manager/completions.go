package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/admin"
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
)

func NativeChatHandler(c *gin.Context, user *auth.User, model string, message []globals.Message, enableWeb bool) (string, float32) {
	defer func() {
		if err := recover(); err != nil {
			globals.Warn(fmt.Sprintf("caught panic from chat handler: %s (instance: %s, client: %s)",
				err, model, c.ClientIP(),
			))
		}
	}()

	segment := web.UsingWebNativeSegment(enableWeb, message)

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, model)

	if !check {
		return defaultQuotaMessage, 0
	}

	if form := ExtractCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}); form != nil {
		return form.Message, 0
	}

	buffer := utils.NewBuffer(model, segment)
	err := adapter.NewChatRequest(&adapter.ChatProps{
		Model:   model,
		Plan:    plan,
		Message: segment,
	}, func(resp string) error {
		buffer.Write(resp)
		return nil
	})

	admin.AnalysisRequest(model, buffer, err)
	if err != nil {
		auth.RevertSubscriptionUsage(cache, user, model, plan)
		CollectQuota(c, user, buffer, plan)
		return err.Error(), GetErrorQuota(model)
	}

	CollectQuota(c, user, buffer, plan)

	SaveCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}, &CacheData{
		Message: buffer.ReadWithDefault(defaultMessage),
	})

	return buffer.ReadWithDefault(defaultMessage), buffer.GetQuota()
}
