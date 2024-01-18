package auth

import (
	"chat/channel"
	"database/sql"
	"github.com/go-redis/redis/v8"
)

func (u *User) GetSubscriptionUsage(db *sql.DB, cache *redis.Client) channel.UsageMap {
	plan := u.GetPlan(db)
	return plan.GetUsage(u, db, cache)
}
