package utils

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func GetDBFromContext(c *gin.Context) *sql.DB {
	return c.MustGet("db").(*sql.DB)
}

func GetCacheFromContext(c *gin.Context) *redis.Client {
	return c.MustGet("cache").(*redis.Client)
}
