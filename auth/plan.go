package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"github.com/go-redis/redis/v8"
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
		Price: 18,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 25, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 50, Including: globals.IsClaude100KModel},
		},
	},
	{
		Level: 2,
		Price: 36,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 50, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 100, Including: globals.IsClaude100KModel},
			{Id: "midjourney", Value: 25, Including: globals.IsMidjourneyFastModel},
		},
	},
	{
		Level: 3,
		Price: 72,
		Usage: []PlanUsage{
			{Id: "gpt-4", Value: 100, Including: globals.IsGPT4NativeModel},
			{Id: "claude-100k", Value: 200, Including: globals.IsClaude100KModel},
			{Id: "midjourney", Value: 50, Including: globals.IsMidjourneyFastModel},
		},
	},
	{
		// enterprise
		Level: 4,
		Price: 999,
		Usage: []PlanUsage{},
	},
}

func IncreaseSubscriptionUsage(cache *redis.Client, user *User, t string, limit int64) bool {
	return utils.IncrWithLimit(cache, globals.GetSubscriptionLimitFormat(t, user.ID), 1, limit, 60*60*24) // 1 day
}

func DecreaseSubscriptionUsage(cache *redis.Client, user *User, t string) bool {
	return utils.DecrInt(cache, globals.GetSubscriptionLimitFormat(t, user.ID), 1)
}

func (p *Plan) GetUsage(user *User, db *sql.DB, cache *redis.Client) UsageMap {
	return utils.EachObject[PlanUsage, Usage](p.Usage, func(usage PlanUsage) (string, Usage) {
		return usage.Id, usage.GetUsageForm(user, db, cache)
	})
}

func (p *PlanUsage) GetUsage(user *User, db *sql.DB, cache *redis.Client) int64 {
	return utils.MustInt(cache, globals.GetSubscriptionLimitFormat(p.Id, user.GetID(db)))
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
