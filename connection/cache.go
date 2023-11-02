package connection

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"log"
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

	if pingRedis(Cache) != nil {
		log.Println(fmt.Sprintf("[connection] failed to connect to redis host: %s, will retry in 5 seconds", viper.GetString("redis.host")))
	} else {
		fmt.Println("拷打")
		log.Println(fmt.Sprintf("[connection] connected to redis (host: %s)", viper.GetString("redis.host")))
	}

	if viper.GetBool("debug") {
		Cache.FlushAll(context.Background())
		log.Println(fmt.Sprintf("[connection] flush redis cache (host: %s)", viper.GetString("redis.host")))
	}
	return Cache
}
