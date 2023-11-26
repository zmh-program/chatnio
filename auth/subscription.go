package auth

import (
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/go-redis/redis/v8"
	"math"
	"time"
)

func (u *User) GetSubscription(db *sql.DB) (time.Time, int) {
	if u.Subscription != nil && u.Subscription.Unix() > 0 {
		return *u.Subscription, u.Level
	}

	var expiredAt []uint8
	if err := db.QueryRow("SELECT expired_at, level FROM subscription WHERE user_id = ?", u.GetID(db)).Scan(&expiredAt, &u.Level); err != nil {
		return time.Unix(0, 0), 0
	}

	u.Subscription = utils.ConvertTime(expiredAt)
	return *u.Subscription, u.Level
}

func (u *User) GetSubscriptionLevel(db *sql.DB) int {
	_, level := u.GetSubscription(db)
	if !u.IsSubscribe(db) {
		return 0
	}
	return level
}

func (u *User) GetPlan(db *sql.DB) Plan {
	return GetLevel(u.GetSubscriptionLevel(db))
}

func (u *User) GetSubscriptionExpiredAt(db *sql.DB) time.Time {
	stamp, _ := u.GetSubscription(db)
	return stamp
}

func (u *User) GetSubscriptionTime(db *sql.DB) time.Time {
	stamp, _ := u.GetSubscription(db)
	return stamp
}

func (u *User) IsSubscribe(db *sql.DB) bool {
	stamp, level := u.GetSubscription(db)
	return stamp.Unix() > time.Now().Unix() && level > 0
}

func (u *User) IsEnterprise(db *sql.DB) bool {
	if !u.IsSubscribe(db) {
		return false
	}

	var enterprise sql.NullBool
	if err := db.QueryRow("SELECT enterprise FROM subscription WHERE user_id = ?", u.GetID(db)).Scan(&enterprise); err != nil {
		return false
	}

	return enterprise.Valid && enterprise.Bool
}

func (u *User) GetSubscriptionExpiredDay(db *sql.DB) int {
	stamp := u.GetSubscriptionTime(db).Sub(time.Now())
	return int(math.Round(stamp.Hours() / 24))
}

func (u *User) AddSubscription(db *sql.DB, month int, level int) bool {
	current := u.GetSubscriptionTime(db)
	if current.Unix() < time.Now().Unix() {
		current = time.Now()
	}
	expiredAt := current.AddDate(0, month, 0)
	date := utils.ConvertSqlTime(expiredAt)
	_, err := db.Exec(`
		INSERT INTO subscription (user_id, expired_at, total_month, level) VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE expired_at = ?, total_month = total_month + ?, level = ?
	`, u.GetID(db), date, month, level, date, month, level)
	return err == nil
}

func (u *User) MigratePlan(db *sql.DB, level int) error {
	current := u.GetSubscriptionLevel(db)
	if current == 0 || current == level {
		return fmt.Errorf("invalid plan level")
	}

	_, err := db.Exec(`CALL migrate_plan(?, ?)`, u.GetID(db), level)

	return err
}

func (u *User) SetSubscriptionLevel(db *sql.DB, level int) bool {
	_, err := db.Exec("UPDATE subscription SET level = ? WHERE user_id = ?", level, u.GetID(db))
	return err == nil
}

func CountSubscriptionPrize(level int, month int) float32 {
	plan := GetLevel(level)
	base := plan.Price * float32(month)
	if month >= 36 {
		return base * 0.7
	} else if month >= 12 {
		return base * 0.8
	} else if month >= 6 {
		return base * 0.9
	}
	return base
}

func BuySubscription(db *sql.DB, cache *redis.Client, user *User, level int, month int) bool {
	if month < 1 || month > 999 || !InLevel(level) {
		return false
	}

	before := user.GetSubscriptionLevel(db)
	if before == 0 || before == level {
		// buy new subscription or renew subscription
		money := CountSubscriptionPrize(level, month)
		fmt.Println(money)
		if user.Pay(cache, money) {
			user.AddSubscription(db, month, level)
			return true
		}
	} else {
		// upgrade or downgrade subscription
		err := user.MigratePlan(db, level)
		if err != nil {
			fmt.Println(err)
		}

		return err == nil
	}

	return false
}

func HandleSubscriptionUsage(db *sql.DB, cache *redis.Client, user *User, model string) bool {
	plan := user.GetPlan(db)
	return plan.IncreaseUsage(user, cache, model)
}

func RevertSubscriptionUsage(db *sql.DB, cache *redis.Client, user *User, model string) bool {
	plan := user.GetPlan(db)
	return plan.DecreaseUsage(user, cache, model)
}
