package auth

import (
	"chat/channel"
	"database/sql"
	"fmt"
	"github.com/go-redis/redis/v8"
)

const (
	ErrNotAuthenticated = "not authenticated error (model: %s)"
	ErrNotSetPrice      = "the price of the model is not set (model: %s)"
	ErrNotEnoughQuota   = "user quota is not enough error (model: %s, minimum quota: %0.2f, your quota: %0.2f)"
)

// CanEnableModel returns whether the model can be enabled (without subscription)
func CanEnableModel(db *sql.DB, user *User, model string) error {
	isAuth := user != nil
	isAdmin := isAuth && user.IsAdmin(db)

	charge := channel.ChargeInstance.GetCharge(model)

	if charge.IsUnsetType() && !isAdmin {
		return fmt.Errorf(ErrNotSetPrice, model)
	}

	if !charge.IsBilling() {
		// return if is the user is authenticated or anonymous is allowed for this model
		if charge.SupportAnonymous() || isAuth {
			return nil
		}

		return fmt.Errorf(ErrNotAuthenticated, model)
	}

	if !isAuth {
		return fmt.Errorf(ErrNotAuthenticated, model)
	}

	// return if the user is authenticated and has enough quota
	limit := charge.GetLimit()

	quota := user.GetQuota(db)
	if quota < limit {
		return fmt.Errorf(ErrNotEnoughQuota, model, limit, quota)
	}

	return nil
}

func CanEnableModelWithSubscription(db *sql.DB, cache *redis.Client, user *User, model string) (canEnable error, usePlan bool) {
	// use subscription quota first
	if user != nil && HandleSubscriptionUsage(db, cache, user, model) {
		return nil, true
	}
	return CanEnableModel(db, user, model), false
}
