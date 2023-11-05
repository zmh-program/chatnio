package auth

import (
	"chat/globals"
	"database/sql"
	"github.com/go-redis/redis/v8"
)

// CanEnableModel returns whether the model can be enabled (without subscription)
func CanEnableModel(db *sql.DB, user *User, model string) bool {
	switch model {
	case globals.GPT3Turbo, globals.GPT3TurboInstruct, globals.GPT3Turbo0301, globals.GPT3Turbo0613:
		return true
	case globals.GPT4, globals.GPT40613, globals.GPT40314:
		return user != nil && user.GetQuota(db) >= 5
	case globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314:
		return user != nil && user.GetQuota(db) >= 50
	case globals.SparkDesk, globals.SparkDeskV2, globals.SparkDeskV3:
		return user != nil // && user.GetQuota(db) >= 1 free now
	case globals.Claude1100k, globals.Claude2100k:
		return user != nil && user.GetQuota(db) >= 1
	case globals.ZhiPuChatGLMPro, globals.ZhiPuChatGLMStd:
		return user != nil && user.GetQuota(db) >= 1
	case globals.QwenTurbo, globals.QwenPlus, globals.QwenPlusNet, globals.QwenTurboNet:
		return user != nil && user.GetQuota(db) >= 1
	default:
		return user != nil
	}
}

func HandleSubscriptionUsage(db *sql.DB, cache *redis.Client, user *User, model string) bool {
	subscription := user.IsSubscribe(db)
	if globals.IsGPT3TurboModel(model) {
		// independent channel for subscription users
		return subscription
	}
	if globals.IsGPT4NativeModel(model) {
		return subscription && IncreaseSubscriptionUsage(cache, user, globals.GPT4, 50)
	} else if globals.IsClaude100KModel(model) {
		if subscription || user.HasTeenagerPackage(db) {
			return IncreaseSubscriptionUsage(cache, user, globals.Claude2100k, 100)
		}
	}

	return false
}

func RevertSubscriptionUsage(cache *redis.Client, user *User, model string, plan bool) {
	if globals.IsGPT4NativeModel(model) && plan {
		DecreaseSubscriptionUsage(cache, user, globals.GPT4)
	} else if globals.IsClaude100KModel(model) && !plan {
		DecreaseSubscriptionUsage(cache, user, globals.Claude2100k)
	}
}

func CanEnableModelWithSubscription(db *sql.DB, cache *redis.Client, user *User, model string) (canEnable bool, usePlan bool) {
	// use subscription quota first
	if user != nil && HandleSubscriptionUsage(db, cache, user, model) {
		return true, true
	}
	return CanEnableModel(db, user, model), false
}
