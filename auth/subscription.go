package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"github.com/go-redis/redis/v8"
)

func CountSubscriptionPrize(month int) float32 {
	base := 32 * float32(month)
	if month >= 36 {
		return base * 0.7
	} else if month >= 12 {
		return base * 0.8
	} else if month >= 6 {
		return base * 0.9
	}
	return base
}

func BuySubscription(db *sql.DB, user *User, month int) bool {
	if month < 1 || month > 999 {
		return false
	}
	money := CountSubscriptionPrize(month)
	if Pay(user.Username, money) {
		user.AddSubscription(db, month)
		return true
	}
	return false
}

func IncreaseSubscriptionUsage(cache *redis.Client, user *User) bool {
	return utils.IncrWithLimit(cache, globals.GetGPT4LimitFormat(user.ID), 1, 50, 60*60*24) // 1 day
}

func DecreaseSubscriptionUsage(cache *redis.Client, user *User) bool {
	return utils.DecrInt(cache, globals.GetGPT4LimitFormat(user.ID), 1)
}

func CanEnableSubscription(db *sql.DB, cache *redis.Client, user *User) bool {
	if user == nil {
		return false
	}
	return user.IsSubscribe(db) && IncreaseSubscriptionUsage(cache, user)
}

func GetDalleUsageLimit(db *sql.DB, user *User) int {
	if user.IsSubscribe(db) {
		return 2000
	}
	return 5
}
