package connection

import (
	"chat/globals"
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

var Cache *redis.Client

func InitRedisSafe() *redis.Client {
	ConnectRedis()

	// using Cache as a global variable to point to the latest redis connection
	RedisWorker(Cache)
	return Cache
}

func ConnectRedis() *redis.Client {
	// connect to redis
	Cache = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", viper.GetString("redis.host"), viper.GetInt("redis.port")),
		Password: viper.GetString("redis.password"),
		DB:       viper.GetInt("redis.db"),
	})

	if err := pingRedis(Cache); err != nil {
		globals.Warn(
			fmt.Sprintf(
				"[connection] failed to connect to redis host: %s (message: %s), will retry in 5 seconds",
				viper.GetString("redis.host"),
				err.Error(),
			),
		)
	} else {
		globals.Debug(fmt.Sprintf("[connection] connected to redis (host: %s)", viper.GetString("redis.host")))
	}

	if viper.GetBool("debug") {
		Cache.FlushAll(context.Background())
		globals.Debug(fmt.Sprintf("[connection] flush redis cache (host: %s)", viper.GetString("redis.host")))
	}
	return Cache
}
