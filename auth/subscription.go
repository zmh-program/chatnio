package auth

import (
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/go-redis/redis/v8"
	"time"
)

func CountSubscriptionPrize(month int) float32 {
	if month >= 12 {
		return 8 * float32(month) * 0.9
	}
	return 8 * float32(month)
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
	today := time.Now().Format("2006-01-02")
	return utils.IncrWithLimit(cache, fmt.Sprintf(":subscription-usage:%s:%d", today, user.ID), 1, 50, 60*60*24) // 1 day
}

func DecreaseSubscriptionUsage(cache *redis.Client, user *User) bool {
	today := time.Now().Format("2006-01-02")
	return utils.DecrInt(cache, fmt.Sprintf(":subscription-usage:%s:%d", today, user.ID), 1)
}

func CanEnableSubscription(db *sql.DB, cache *redis.Client, user *User) bool {
	return user.IsSubscribe(db) && IncreaseSubscriptionUsage(cache, user)
}

func GetDalleUsageLimit(db *sql.DB, user *User) int {
	if user.IsSubscribe(db) {
		return 50
	}
	return 5
}
