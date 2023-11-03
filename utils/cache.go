package utils

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"time"
)

func Incr(cache *redis.Client, key string, delta int64) (int64, error) {
	return cache.IncrBy(context.Background(), key, delta).Result()
}

func Decr(cache *redis.Client, key string, delta int64) (int64, error) {
	return cache.DecrBy(context.Background(), key, delta).Result()
}

func GetInt(cache *redis.Client, key string) (int64, error) {
	return cache.Get(context.Background(), key).Int64()
}

func MustInt(cache *redis.Client, key string) int64 {
	val, err := cache.Get(context.Background(), key).Int64()
	if err != nil {
		return 0
	}
	return val
}

func SetInt(cache *redis.Client, key string, value int64, expiration int64) error {
	return cache.Set(context.Background(), key, value, time.Duration(expiration)*time.Second).Err()
}

func IncrWithLimit(cache *redis.Client, key string, delta int64, limit int64, expiration int64) bool {
	// not exist
	if _, err := cache.Get(context.Background(), key).Result(); err != nil {
		if err == redis.Nil {
			cache.Set(context.Background(), key, delta, time.Duration(expiration)*time.Second)
			return true
		}
		return false
	}
	res, err := Incr(cache, key, delta)
	if err != nil {
		return false
	}
	if res > limit {
		cache.Set(context.Background(), key, limit, time.Duration(expiration)*time.Second)
		return false
	}
	return true
}

func DecrInt(cache *redis.Client, key string, delta int64) bool {
	_, err := Decr(cache, key, delta)
	return err == nil
}

func IncrIP(cache *redis.Client, ip string) int64 {
	val, err := Incr(cache, fmt.Sprintf(":ip-rate:%s", ip), 1)
	if err != nil && err == redis.Nil {
		cache.Set(context.Background(), fmt.Sprintf(":ip-rate:%s", ip), 1, time.Minute*20)
		return 1
	}
	return val
}

func IsInBlackList(cache *redis.Client, ip string) bool {
	val, err := GetInt(cache, fmt.Sprintf(":ip-rate:%s", ip))
	return err == nil && val > 50
}
