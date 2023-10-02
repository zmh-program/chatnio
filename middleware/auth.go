package middleware

import (
	"chat/auth"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func ProcessToken(c *gin.Context, token string) bool {
	if user := auth.ParseToken(c, token); user != nil {
		c.Set("auth", true)
		c.Set("user", user.Username)
		c.Set("agent", "token")
		c.Next()
		return true
	}
	return false
}

func ProcessKey(c *gin.Context, key string) bool {
	addr := c.ClientIP()
	cache := utils.GetCacheFromContext(c)

	if utils.IsInBlackList(cache, addr) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"code":    403,
			"message": "ip in black list",
		})
		return false
	}

	if user := auth.ParseApiKey(c, key); user != nil {
		c.Set("auth", true)
		c.Set("user", user.Username)
		c.Set("agent", "api")
		c.Next()
		return true
	}

	utils.IncrIP(cache, addr)
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"code":    401,
		"message": "Access denied. Please provide correct api key.",
	})
	return false
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		k := strings.TrimSpace(c.GetHeader("Authorization"))
		if k != "" {
			if strings.HasPrefix(k, "Bearer ") {
				k, _ = strings.CutPrefix(k, "Bearer ")
			}

			if strings.HasPrefix(k, "sk-") { // api agent
				if ProcessKey(c, k) {
					return
				}
			} else { // token agent
				if ProcessToken(c, k) {
					return
				}
			}
		}

		c.Set("auth", false)
		c.Set("user", "")
		c.Set("agent", "")
		c.Next()
	}
}
