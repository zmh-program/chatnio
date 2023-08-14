package auth

import (
	"github.com/gin-gonic/gin"
	"strings"
)

func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimSpace(c.GetHeader("Authorization"))
		if token != "" {
			if user := ParseToken(c, token); user != nil {
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

func GetToken(c *gin.Context) string {
	return c.GetString("token")
}

func GetUser(c *gin.Context) *User {
	if c.GetBool("auth") {
		return &User{
			Username: c.GetString("user"),
		}
	}
	return nil
}
