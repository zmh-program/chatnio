package auth

import (
	"chat/channel"
	"database/sql"
	"github.com/go-redis/redis/v8"
)

// CanEnableModel returns whether the model can be enabled (without subscription)
func CanEnableModel(db *sql.DB, user *User, model string) bool {
	isAuth := user != nil
	charge := channel.ChargeInstance.GetCharge(model)

	if !charge.IsBilling() {
		// return if is the user is authenticated or anonymous is allowed for this model
		return charge.SupportAnonymous() || isAuth
	}

	// return if the user is authenticated and has enough quota
	return isAuth && user.GetQuota(db) >= charge.GetLimit()
}

func CanEnableModelWithSubscription(db *sql.DB, cache *redis.Client, user *User, model string) (canEnable bool, usePlan bool) {
	// use subscription quota first
	if user != nil && HandleSubscriptionUsage(db, cache, user, model) {
		return true, true
	}
	return CanEnableModel(db, user, model), false
}
