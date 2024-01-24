package admin

import (
	"chat/channel"
	"chat/utils"
	"database/sql"
	"github.com/go-redis/redis/v8"
	"time"
)

type UserTypeForm struct {
	Normal       int64 `json:"normal"`
	ApiPaid      int64 `json:"api_paid"`
	BasicPlan    int64 `json:"basic_plan"`
	StandardPlan int64 `json:"standard_plan"`
	ProPlan      int64 `json:"pro_plan"`
	Total        int64 `json:"total"`
}

func getDates(t []time.Time) []string {
	return utils.Each[time.Time, string](t, func(date time.Time) string {
		return date.Format("1/2")
	})
}

func getFormat(t time.Time) string {
	return t.Format("2006-01-02")
}

func GetSubscriptionUsers(db *sql.DB) int64 {
	var count int64
	err := db.QueryRow(`
   		SELECT COUNT(*) FROM subscription WHERE expired_at > NOW()
   	`).Scan(&count)
	if err != nil {
		return 0
	}

	return count
}

func GetBillingToday(cache *redis.Client) float32 {
	return float32(utils.MustInt(cache, getBillingFormat(getDay()))) / 100
}

func GetBillingMonth(cache *redis.Client) float32 {
	return float32(utils.MustInt(cache, getMonthBillingFormat(getMonth()))) / 100
}

func GetModelData(cache *redis.Client) ModelChartForm {
	dates := getDays(7)

	return ModelChartForm{
		Date: getDates(dates),
		Value: utils.EachNotNil[string, ModelData](channel.ConduitInstance.GetModels(), func(model string) *ModelData {
			data := ModelData{
				Model: model,
				Data: utils.Each[time.Time, int64](dates, func(date time.Time) int64 {
					return utils.MustInt(cache, getModelFormat(getFormat(date), model))
				}),
			}
			if utils.Sum(data.Data) == 0 {
				return nil
			}

			return &data
		}),
	}
}

func GetSortedModelData(cache *redis.Client) ModelChartForm {
	form := GetModelData(cache)
	data := utils.Sort(form.Value, func(a ModelData, b ModelData) bool {
		return utils.Sum(a.Data) > utils.Sum(b.Data)
	})

	form.Value = data

	return form
}

func GetRequestData(cache *redis.Client) RequestChartForm {
	dates := getDays(7)

	return RequestChartForm{
		Date: getDates(dates),
		Value: utils.Each[time.Time, int64](dates, func(date time.Time) int64 {
			return utils.MustInt(cache, getRequestFormat(getFormat(date)))
		}),
	}
}

func GetBillingData(cache *redis.Client) BillingChartForm {
	dates := getDays(30)

	return BillingChartForm{
		Date: getDates(dates),
		Value: utils.Each[time.Time, float32](dates, func(date time.Time) float32 {
			return float32(utils.MustInt(cache, getBillingFormat(getFormat(date)))) / 100.
		}),
	}
}

func GetErrorData(cache *redis.Client) ErrorChartForm {
	dates := getDays(7)

	return ErrorChartForm{
		Date: getDates(dates),
		Value: utils.Each[time.Time, int64](dates, func(date time.Time) int64 {
			return utils.MustInt(cache, getErrorFormat(getFormat(date)))
		}),
	}
}

func GetUserTypeData(db *sql.DB) (UserTypeForm, error) {
	var form UserTypeForm

	// get total users
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM auth
	`).Scan(&form.Total); err != nil {
		return form, err
	}

	// get subscription users count (current subscription)
	// level 1: basic plan, level 2: standard plan, level 3: pro plan
	if err := db.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM subscription WHERE level = 1 AND expired_at > NOW()),
			(SELECT COUNT(*) FROM subscription WHERE level = 2 AND expired_at > NOW()),
			(SELECT COUNT(*) FROM subscription WHERE level = 3 AND expired_at > NOW())
	`).Scan(&form.BasicPlan, &form.StandardPlan, &form.ProPlan); err != nil {
		return form, err
	}

	initialQuota := channel.SystemInstance.GetInitialQuota()

	// get api paid users count
	// match any of the following conditions to be considered as api paid user
	// condition 1: `quota` + `used` > initial_quota in `quota` table
	// condition 2: have subscription `total_month` > 0 but expired in `subscription` table

	// condition 1: get `quota` + `used` > initial_quota count in `quota` table but do not have subscription
	var quotaPaid int64
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM (
			SELECT
				(SELECT COUNT(*) FROM quota WHERE quota + used > ? AND user_id NOT IN (SELECT user_id FROM subscription WHERE total_month > 0 AND expired_at > NOW()))
		) AS quota_paid
	`, initialQuota).Scan(&quotaPaid); err != nil {
		return form, err
	}

	// condition 2: get subscription `total_month` > 0 but expired count in `subscription` table, but do not have `quota` + `used` > initial_quota
	var subscriptionPaid int64
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM (
			SELECT
				(SELECT COUNT(*) FROM subscription WHERE total_month > 0 AND expired_at > NOW() 
				                                     AND user_id NOT IN (SELECT user_id FROM quota WHERE quota + used > ?))
		) AS subscription_paid
	`, initialQuota).Scan(&subscriptionPaid); err != nil {
		return form, err
	}

	form.ApiPaid = quotaPaid + subscriptionPaid

	// get normal users count
	form.Normal = form.Total - form.ApiPaid - form.BasicPlan - form.StandardPlan - form.ProPlan

	return form, nil
}
