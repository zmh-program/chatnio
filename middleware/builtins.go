package middleware

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func BuiltinMiddleWare(db *sql.DB, cache *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Set("cache", cache)
		c.Next()
	}
}
