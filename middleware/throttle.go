package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"strings"
	"time"
)

type Limiter struct {
	Duration int
	Count    int64
}

func (l *Limiter) RateLimit(ctx *gin.Context, rds *redis.Client, ip string, path string) bool {
	key := fmt.Sprintf("rate%s:%s", path, ip)
	count, err := rds.Incr(ctx, key).Result()
	if err != nil {
		return true
	}
	if count == 1 {
		rds.Expire(ctx, key, time.Duration(l.Duration)*time.Second)
	}
	return count > l.Count
}

var limits = map[string]Limiter{
	"/login":         {Duration: 10, Count: 5},
	"/api/anonymous": {Duration: 60, Count: 15},
	"/api/user":      {Duration: 1, Count: 1},
}

func GetPrefixMap[T comparable](s string, p map[string]T) *T {
	for k, v := range p {
		if strings.HasPrefix(s, k) {
			return &v
		}
	}
	return nil
}

func ThrottleMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		path := c.Request.URL.Path
		rds := c.MustGet("cache").(*redis.Client)
		limiter := GetPrefixMap[Limiter](path, limits)
		if limiter != nil && limiter.RateLimit(c, rds, ip, path) {
			c.JSON(200, gin.H{"status": false, "reason": "You have sent too many requests. Please try again later."})
			c.Abort()
			return
		}
		c.Next()
	}
}
