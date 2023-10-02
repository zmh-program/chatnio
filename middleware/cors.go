package middleware

import (
	"chat/globals"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// open api for all origins
		if strings.HasPrefix(c.Request.URL.Path, "/v1") {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Auth-Token, X-Requested-With, X-Forwarded-For, X-Real-IP, X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-Port")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

			if c.Request.Method == "OPTIONS" {
				c.Writer.Header().Set("Access-Control-Max-Age", "7200")
				c.AbortWithStatus(http.StatusOK)
				return
			}
			c.Next()
			return
		}

		origin := c.Request.Header.Get("Origin")
		if utils.Contains(origin, globals.AllowedOrigins) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

			if c.Request.Method == "OPTIONS" {
				c.Writer.Header().Set("Access-Control-Max-Age", "7200")
				c.AbortWithStatus(http.StatusOK)
				return
			}
		}

		c.Next()
	}
}
