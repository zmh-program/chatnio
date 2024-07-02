package admin

import (
	"chat/adapter"
	"chat/connection"
	"chat/utils"
	"time"

	"github.com/go-redis/redis/v8"
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

func AnalyseRequest(model string, buffer *utils.Buffer, err error) {
	instance := connection.Cache

	if adapter.IsAvailableError(err) {
		IncrErrorRequest(instance)
		return
	}

	IncrRequest(instance)
	IncrModelRequest(instance, model, int64(buffer.CountToken()))
}
