package admin

import (
	"chat/connection"
	"chat/utils"
	"github.com/go-redis/redis/v8"
	"time"
)

func IncrErrorRequest(cache *redis.Client) {
	utils.IncrOnce(cache, getErrorFormat(getDay()), time.Hour*24*7*2)
}

func IncrBillingRequest(cache *redis.Client, amount int64) {
	utils.IncrWithExpire(cache, getBillingFormat(getDay()), amount, time.Hour*24*30*2)
	utils.IncrWithExpire(cache, getMonthBillingFormat(getMonth()), amount, time.Hour*24*30*2)
}

func IncrRequest(cache *redis.Client) {
	utils.IncrOnce(cache, getRequestFormat(getDay()), time.Hour*24*7*2)
}

func IncrModelRequest(cache *redis.Client, model string, tokens int64) {
	utils.IncrWithExpire(cache, getModelFormat(getDay(), model), tokens, time.Hour*24*7*2)
}

func AnalysisRequest(model string, buffer *utils.Buffer, err error) {
	instance := connection.Cache

	if err != nil && err.Error() != "signal" {
		IncrErrorRequest(instance)
		return
	}

	IncrRequest(instance)
	IncrModelRequest(instance, model, int64(buffer.CountToken()))
}
