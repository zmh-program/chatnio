package admin

import (
	"chat/channel"
	"chat/utils"
	"database/sql"
	"github.com/go-redis/redis/v8"
	"time"
)

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
