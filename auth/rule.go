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
	case globals.GPT4, globals.GPT40613, globals.GPT40314, globals.GPT41106Preview, globals.GPT41106VisionPreview,
		globals.GPT4Dalle, globals.GPT4Vision, globals.Dalle3:
		return user != nil && user.GetQuota(db) >= 5
	case globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314:
		return user != nil && user.GetQuota(db) >= 50
	case globals.SparkDesk, globals.SparkDeskV2, globals.SparkDeskV3:
		return user != nil && user.GetQuota(db) >= 1
	case globals.Claude1100k, globals.Claude2100k:
		return user != nil && user.GetQuota(db) >= 1
	case globals.ZhiPuChatGLMTurbo, globals.ZhiPuChatGLMPro, globals.ZhiPuChatGLMStd:
		return user != nil && user.GetQuota(db) >= 1
	case globals.QwenTurbo, globals.QwenPlus, globals.QwenPlusNet, globals.QwenTurboNet:
		return user != nil && user.GetQuota(db) >= 1
	case globals.StableDiffusion, globals.Midjourney, globals.MidjourneyFast, globals.MidjourneyTurbo:
		return user != nil && user.GetQuota(db) >= 1
	case globals.LLaMa27B, globals.LLaMa213B, globals.LLaMa270B,
		globals.CodeLLaMa34B, globals.CodeLLaMa13B, globals.CodeLLaMa7B:
		return user != nil && user.GetQuota(db) >= 1
	case globals.Hunyuan, globals.GPT360V9, globals.Baichuan53B:
		return user != nil && user.GetQuota(db) >= 1
	case globals.SkylarkLite, globals.SkylarkPlus, globals.SkylarkPro, globals.SkylarkChat:
		return user != nil && user.GetQuota(db) >= 1
	default:
		return user != nil
	}
}

func CanEnableModelWithSubscription(db *sql.DB, cache *redis.Client, user *User, model string) (canEnable bool, usePlan bool) {
	// use subscription quota first
	if user != nil && HandleSubscriptionUsage(db, cache, user, model) {
		return true, true
	}
	return CanEnableModel(db, user, model), false
}
