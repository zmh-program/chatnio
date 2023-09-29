package middleware

import (
	"chat/auth"
	"github.com/gin-gonic/gin"
	"strings"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimSpace(c.GetHeader("Authorization"))
		if token != "" {
			if user := auth.ParseToken(c, token); user != nil {
				c.Set("token", token)
				c.Set("auth", true)
				c.Set("user", user.Username)
				c.Next()
				return
			}
		}

		c.Set("token", token)
		c.Set("auth", false)
		c.Set("user", "")
		c.Next()
	}
}
