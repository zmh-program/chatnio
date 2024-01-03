package auth

import (
	"chat/utils"
	"fmt"
	"github.com/go-redis/redis/v8"
	"time"
)

func getMonth() string {
	date := time.Now()
	return date.Format("2006-01")
}

func getDay() string {
	date := time.Now()
	return date.Format("2006-01-02")
}

func getBillingFormat(t string) string {
	return fmt.Sprintf("nio:billing-analysis-%s", t)
}

func getMonthBillingFormat(t string) string {
	return fmt.Sprintf("nio:billing-analysis-%s", t)
}

func incrBillingRequest(cache *redis.Client, amount int64) {
	utils.IncrWithExpire(cache, getBillingFormat(getDay()), amount, time.Hour*24*30*2)
	utils.IncrWithExpire(cache, getMonthBillingFormat(getMonth()), amount, time.Hour*24*30*2)
}
