package utils

import (
	"context"
	"errors"
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

func SetJson(cache *redis.Client, key string, value interface{}, expiration int64) error {
	err := cache.Set(context.Background(), key, Marshal(value), time.Duration(expiration)*time.Second).Err()
	return err
}

func GetCacheStore[T any](cache *redis.Client, key string) *T {
	val, err := cache.Get(context.Background(), key).Result()
	if err != nil {
		return nil
	}
	return UnmarshalForm[T](val)
}

func GetCache(cache *redis.Client, key string) (string, error) {
	return cache.Get(context.Background(), key).Result()
}

func SetCache(cache *redis.Client, key string, value string, expiration int64) error {
	return cache.Set(context.Background(), key, value, time.Duration(expiration)*time.Second).Err()
}

func IncrWithLimit(cache *redis.Client, key string, delta int64, limit int64, expiration int64) (bool, error) {
	// not exist
	if _, err := cache.Get(context.Background(), key).Result(); err != nil {
		if errors.Is(err, redis.Nil) {
			cache.Set(context.Background(), key, delta, time.Duration(expiration)*time.Second)
			return true, nil
		}
		return false, err
	}
	res, err := Incr(cache, key, delta)
	if err != nil {
		return false, err
	}
	if res > limit {
		// reset
		cache.Set(context.Background(), key, limit, time.Duration(expiration)*time.Second)
		return false, nil
	}
	return true, nil
}

func DecrInt(cache *redis.Client, key string, delta int64) bool {
	_, err := Decr(cache, key, delta)
	return err == nil
}

func IncrIP(cache *redis.Client, ip string) int64 {
	key := fmt.Sprintf(":ip-rate:%s", ip)
	val, err := Incr(cache, key, 1)
	if err != nil && errors.Is(err, redis.Nil) {
		cache.Set(context.Background(), key, 1, time.Minute*20)
		return 1
	}

	cache.Expire(context.Background(), key, time.Minute*20)
	return val
}

func IncrWithExpire(cache *redis.Client, key string, delta int64, expiration time.Duration) {
	_, err := Incr(cache, key, delta)
	if err != nil && errors.Is(err, redis.Nil) {
		cache.Set(context.Background(), key, delta, expiration)
	}
}

func IncrOnce(cache *redis.Client, key string, expiration time.Duration) {
	IncrWithExpire(cache, key, 1, expiration)
}

func IsInBlackList(cache *redis.Client, ip string) bool {
	val, err := GetInt(cache, fmt.Sprintf(":ip-rate:%s", ip))
	return err == nil && val > 50
}
