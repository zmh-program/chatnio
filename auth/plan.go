package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"strings"
	"time"
)

type Plan struct {
	Level int
	Price float32
	Usage []PlanUsage
}

type PlanUsage struct {
	Id        string
	Value     int64
	Including func(string) bool
}

type Usage struct {
	Used  int64 `json:"used"`
	Total int64 `json:"total"`
}
type UsageMap map[string]Usage

var Plans = []Plan{
	{
		Level: 0,
		Price: 0,
		Usage: []PlanUsage{},
	},
	{
		Level: 1,
		Price: 42,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 150, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 300, Including: globals.IsClaude100KModel},
			{Id: "midjourney", Value: 50, Including: globals.IsMidjourneyFastModel},
		},
	},
	{
		Level: 2,
		Price: 76,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 300, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 600, Including: globals.IsClaude100KModel},
			{Id: "midjourney", Value: 100, Including: globals.IsMidjourneyFastModel},
		},
	},
	{
		Level: 3,
		Price: 148,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 100, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 1200, Including: globals.IsClaude100KModel},
			{Id: "midjourney", Value: 200, Including: globals.IsMidjourneyFastModel},
		},
	},
}

var planExp int64 = 0

func getOffsetFormat(offset time.Time, usage int64) string {
	return fmt.Sprintf("%s/%d", offset.Format("2006-01-02:15:04:05"), usage)
}

func GetSubscriptionUsage(cache *redis.Client, user *User, t string) (usage int64, offset time.Time) {
	// example cache value: 2021-09-01:19:00:00/100
	// if date is longer than 1 month, reset usage

	offset = time.Now()

	key := globals.GetSubscriptionLimitFormat(t, user.ID)
	v, err := utils.GetCache(cache, key)
	if (err != nil && errors.Is(err, redis.Nil)) || len(v) == 0 {
		usage = 0
	}

	seg := strings.Split(v, "/")
	if len(seg) != 2 {
		usage = 0
	} else {
		date, err := time.Parse("2006-01-02:15:04:05", seg[0])
		usage = utils.ParseInt64(seg[1])
		if err != nil {
			usage = 0
		}

		// check if date is longer than current date after 1 month, if true, reset usage

		if date.AddDate(0, 1, 0).Before(time.Now()) {
			// date is longer than 1 month, reset usage
			usage = 0

			// get current date offset (1 month step)
			// example: 2021-09-01:19:00:0/100 -> 2021-10-01:19:00:00/100

			// copy date to offset
			offset = date

			// example:
			// current time: 2021-09-08:14:00:00
			// offset: 2021-07-01:19:00:00
			// expected offset: 2021-09-01:19:00:00
			// offset is not longer than current date, stop adding 1 month

			for offset.AddDate(0, 1, 0).Before(time.Now()) {
				offset = offset.AddDate(0, 1, 0)
			}
		} else {
			// date is not longer than 1 month, use current date value

			offset = date
		}
	}

	// set new cache value
	_ = utils.SetCache(cache, key, getOffsetFormat(offset, usage), planExp)

	return
}

func IncreaseSubscriptionUsage(cache *redis.Client, user *User, t string, limit int64) bool {
	key := globals.GetSubscriptionLimitFormat(t, user.ID)
	usage, offset := GetSubscriptionUsage(cache, user, t)

	usage += 1
	if usage > limit {
		return false
	}

	// set new cache value
	err := utils.SetCache(cache, key, getOffsetFormat(offset, usage), planExp)
	return err == nil
}

func DecreaseSubscriptionUsage(cache *redis.Client, user *User, t string) bool {
	key := globals.GetSubscriptionLimitFormat(t, user.ID)
	usage, offset := GetSubscriptionUsage(cache, user, t)

	usage -= 1
	if usage < 0 {
		return true
	}

	// set new cache value
	err := utils.SetCache(cache, key, getOffsetFormat(offset, usage), planExp)
	return err == nil
}

func (p *Plan) GetUsage(user *User, db *sql.DB, cache *redis.Client) UsageMap {
	return utils.EachObject[PlanUsage, Usage](p.Usage, func(usage PlanUsage) (string, Usage) {
		return usage.Id, usage.GetUsageForm(user, db, cache)
	})
}

func (p *PlanUsage) GetUsage(user *User, db *sql.DB, cache *redis.Client) int64 {
	// preflight check
	user.GetID(db)
	usage, _ := GetSubscriptionUsage(cache, user, p.Id)
	return usage
}

func (p *PlanUsage) ResetUsage(user *User, cache *redis.Client) bool {
	key := globals.GetSubscriptionLimitFormat(p.Id, user.ID)
	_, offset := GetSubscriptionUsage(cache, user, p.Id)

	err := utils.SetCache(cache, key, getOffsetFormat(offset, 0), planExp)
	return err == nil
}

func (p *PlanUsage) CreateUsage(user *User, cache *redis.Client) bool {
	key := globals.GetSubscriptionLimitFormat(p.Id, user.ID)

	err := utils.SetCache(cache, key, getOffsetFormat(time.Now(), 0), planExp)
	return err == nil
}

func (p *PlanUsage) GetUsageForm(user *User, db *sql.DB, cache *redis.Client) Usage {
	return Usage{
		Used:  p.GetUsage(user, db, cache),
		Total: p.Value,
	}
}

func (p *PlanUsage) IsInfinity() bool {
	return p.Value == -1
}

func (p *PlanUsage) IsExceeded(user *User, db *sql.DB, cache *redis.Client) bool {
	return p.IsInfinity() || p.GetUsage(user, db, cache) < p.Value
}

func (p *PlanUsage) Increase(user *User, cache *redis.Client) bool {
	if p.Value == -1 {
		return true
	}
	return IncreaseSubscriptionUsage(cache, user, p.Id, p.Value)
}

func (p *PlanUsage) Decrease(user *User, cache *redis.Client) bool {
	if p.Value == -1 {
		return true
	}
	return DecreaseSubscriptionUsage(cache, user, p.Id)
}

func (u *User) GetSubscriptionUsage(db *sql.DB, cache *redis.Client) UsageMap {
	plan := u.GetPlan(db)
	return plan.GetUsage(u, db, cache)
}

func (p *Plan) IncreaseUsage(user *User, cache *redis.Client, model string) bool {
	for _, usage := range p.Usage {
		if usage.Including(model) {
			return usage.Increase(user, cache)
		}
	}

	return false
}

func (p *Plan) DecreaseUsage(user *User, cache *redis.Client, model string) bool {
	for _, usage := range p.Usage {
		if usage.Including(model) {
			return usage.Decrease(user, cache)
		}
	}

	return false
}

func GetLevel(level int) Plan {
	for _, plan := range Plans {
		if plan.Level == level {
			return plan
		}
	}
	return Plan{}
}

func InLevel(level int) bool {
	return utils.InRange(level, 1, 3)
}
