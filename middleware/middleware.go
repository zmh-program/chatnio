package middleware

import (
	"chat/connection"
	"github.com/gin-gonic/gin"
)

func RegisterMiddleware(app *gin.Engine) {
	app.Use(CORSMiddleware())
	app.Use(BuiltinMiddleWare(connection.ConnectMySQL(), connection.ConnectRedis()))
	app.Use(ThrottleMiddleware())
	app.Use(AuthMiddleware())
}
