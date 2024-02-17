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

	if check != nil {
		return check.Error(), 0
	}

	buffer := utils.NewBuffer(model, segment, channel.ChargeInstance.GetCharge(model))
	hit, err := channel.NewChatRequestWithCache(
		cache, buffer,
		auth.GetGroup(db, user),
		&adapter.ChatProps{
			Model:   model,
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
		return err.Error(), 0
	}

	if !hit {
		CollectQuota(c, user, buffer, plan, err)
	}

	return buffer.ReadWithDefault(defaultMessage), buffer.GetQuota()
}
