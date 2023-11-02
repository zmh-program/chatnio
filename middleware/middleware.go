package middleware

import (
	"chat/connection"
	"github.com/gin-gonic/gin"
)

func RegisterMiddleware(app *gin.Engine) {
	app.Use(CORSMiddleware())
	app.Use(BuiltinMiddleWare(connection.InitMySQLSafe(), connection.InitRedisSafe()))
	app.Use(ThrottleMiddleware())
	app.Use(AuthMiddleware())
}
