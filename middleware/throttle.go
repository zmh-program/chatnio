package middleware

import (
	"chat/admin"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"strings"
)

type Limiter struct {
	Duration int
	Count    int64
}

func (l *Limiter) RateLimit(client *redis.Client, ip string, path string) bool {
	key := fmt.Sprintf("rate:%s:%s", path, ip)
	rate := utils.IncrWithLimit(client, key, 1, l.Count, int64(l.Duration))
	return !rate
}

var limits = map[string]Limiter{
	"/login":        {Duration: 10, Count: 20},
	"/apikey":       {Duration: 1, Count: 2},
	"/package":      {Duration: 1, Count: 2},
	"/quota":        {Duration: 1, Count: 2},
	"/buy":          {Duration: 1, Count: 2},
	"/subscribe":    {Duration: 1, Count: 2},
	"/subscription": {Duration: 1, Count: 2},
	"/chat":         {Duration: 1, Count: 5},
	"/conversation": {Duration: 1, Count: 5},
	"/invite":       {Duration: 7200, Count: 20},
	"/v1":           {Duration: 1, Count: 600},
	"/dashboard":    {Duration: 1, Count: 5},
	"/card":         {Duration: 1, Count: 5},
	"/generation":   {Duration: 1, Count: 5},
	"/article":      {Duration: 1, Count: 5},
	"/broadcast":    {Duration: 1, Count: 2},
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
		cache := utils.GetCacheFromContext(c)
		admin.IncrRequest(cache)
		limiter := GetPrefixMap[Limiter](path, limits)
		if limiter != nil && limiter.RateLimit(cache, ip, path) {
			c.JSON(200, gin.H{"status": false, "reason": "You have sent too many requests. Please try again later."})
			c.Abort()
			return
		}
		c.Next()
	}
}
