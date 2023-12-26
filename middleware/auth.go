package middleware

import (
	"chat/auth"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

func ProcessToken(c *gin.Context, token string) *auth.User {
	if user := auth.ParseToken(c, token); user != nil {
		c.Set("auth", true)
		c.Set("user", user.Username)
		c.Set("agent", "token")
		return user
	}

	c.Set("auth", false)
	c.Set("user", "")
	c.Set("agent", "")
	return nil
}

func ProcessKey(c *gin.Context, key string) *auth.User {
	addr := c.ClientIP()
	cache := utils.GetCacheFromContext(c)

	if utils.IsInBlackList(cache, addr) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"code":    403,
			"message": "ip in black list",
		})
		return nil
	}

	if user := auth.ParseApiKey(c, key); user != nil {
		c.Set("auth", true)
		c.Set("user", user.Username)
		c.Set("agent", "api")
		return user
	}

	utils.IncrIP(cache, addr)
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"code":    401,
		"message": "Access denied. Please provide correct api key.",
	})
	return nil
}

func ProcessAuthorization(c *gin.Context) *auth.User {
	k := strings.TrimSpace(c.GetHeader("Authorization"))
	if k != "" {
		if strings.HasPrefix(k, "Bearer ") {
			k = strings.TrimPrefix(k, "Bearer ")
		}

		if strings.HasPrefix(k, "sk-") {
			// api agent
			return ProcessKey(c, k)
		} else {
			// token agent
			return ProcessToken(c, k)
		}
	}

	c.Set("auth", false)
	c.Set("user", "")
	c.Set("agent", "")
	return nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		instance := ProcessAuthorization(c)

		if viper.GetBool("serve_static") {
			if !strings.HasPrefix(path, "/api") {
				return
			} else {
				path = strings.TrimPrefix(path, "/api")
			}
		}

		db := utils.GetDBFromContext(c)

		admin := instance != nil && instance.IsAdmin(db)
		c.Set("admin", admin)
		if strings.HasPrefix(path, "/admin") {
			if !admin {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"code":    401,
					"message": "Access denied.",
				})
				return
			}
		}

		c.Next()
	}
}
