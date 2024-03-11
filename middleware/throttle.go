package middleware

import (
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"strings"
)

type Limiter struct {
	Duration int
	Count    int64
}

func (l *Limiter) RateLimit(client *redis.Client, ip string, path string) (bool, error) {
	key := fmt.Sprintf("rate:%s:%s", path, ip)
	rate, err := utils.IncrWithLimit(client, key, 1, l.Count, int64(l.Duration))
	return !rate, err
}

var limits = map[string]Limiter{
	"/login":        {Duration: 10, Count: 20},
	"/register":     {Duration: 120, Count: 10},
	"/verify":       {Duration: 120, Count: 10},
	"/reset":        {Duration: 120, Count: 10},
	"/apikey":       {Duration: 1, Count: 2},
	"/resetkey":     {Duration: 3600, Count: 3},
	"/package":      {Duration: 1, Count: 2},
	"/quota":        {Duration: 1, Count: 2},
	"/buy":          {Duration: 1, Count: 2},
	"/subscribe":    {Duration: 1, Count: 2},
	"/subscription": {Duration: 1, Count: 2},
	"/chat":         {Duration: 1, Count: 5},
	"/conversation": {Duration: 1, Count: 5},
	"/invite":       {Duration: 7200, Count: 20},
	"/redeem":       {Duration: 1200, Count: 60},
	"/dashboard":    {Duration: 1, Count: 5},
	"/card":         {Duration: 1, Count: 5},
	"/generation":   {Duration: 1, Count: 5},
	"/article":      {Duration: 1, Count: 5},
	"/broadcast":    {Duration: 1, Count: 2},
}

func GetPrefixMap[T comparable](s string, p map[string]T) *T {
	if viper.GetBool("serve_static") {
		s = strings.TrimPrefix(s, "/api")
	}

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

		limiter := GetPrefixMap[Limiter](path, limits)
		if limiter != nil {
			rate, err := limiter.RateLimit(cache, ip, path)

			if err != nil {
				c.JSON(200, gin.H{
					"status": false,
					"reason": err.Error(),
					"error":  err.Error(),
				})
				c.Abort()
				return
			}

			if rate {
				c.JSON(200, gin.H{
					"status": false,
					"reason": "You have sent too many requests. Please try again later.",
					"error":  "request_throttled",
				})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
