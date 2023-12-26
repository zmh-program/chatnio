package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/admin"
	"chat/auth"
	"chat/channel"
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

	buffer := utils.NewBuffer(model, segment, channel.ChargeInstance.GetCharge(model))
	err := channel.NewChatRequest(
		auth.GetGroup(db, user),
		&adapter.ChatProps{
			Model:   model,
			Plan:    plan,
			Message: segment,
			Buffer:  *buffer,
		},
		func(resp string) error {
			buffer.Write(resp)
			return nil
		},
	)

	admin.AnalysisRequest(model, buffer, err)
	if err != nil {
		auth.RevertSubscriptionUsage(db, cache, user, model)
		CollectQuota(c, user, buffer, plan, err)
		return err.Error(), 0
	}

	CollectQuota(c, user, buffer, plan, err)

	SaveCacheData(c, &CacheProps{
		Message:    segment,
		Model:      model,
		Reversible: plan,
	}, &CacheData{
		Message: buffer.ReadWithDefault(defaultMessage),
	})

	return buffer.ReadWithDefault(defaultMessage), buffer.GetQuota()
}
