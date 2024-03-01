package connection

import (
	"database/sql"
	"github.com/go-redis/redis/v8"
	"time"
)

var tick time.Duration = 5 * time.Second // tick every 5 second

func MysqlWorker(db *sql.DB) {
	go func() {
		for {
			if db == nil || db.Ping() != nil {
				db = ConnectDatabase()
			}

			time.Sleep(tick)
		}
	}()
}

func pingRedis(client *redis.Client) error {
	if _, err := client.Ping(client.Context()).Result(); err != nil {
		return err
	}
	return nil
}

func RedisWorker(cache *redis.Client) {
	go func() {
		for {
			if cache == nil || pingRedis(cache) != nil {
				cache = ConnectRedis()
			}

			time.Sleep(tick)
		}
	}()
}
