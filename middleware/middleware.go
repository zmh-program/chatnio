package middleware

import (
	"chat/connection"
	"github.com/gin-gonic/gin"
)

func RegisterMiddleware(app *gin.Engine) func() {
	db := connection.InitMySQLSafe()
	cache := connection.InitRedisSafe()

	app.Use(CORSMiddleware())
	app.Use(BuiltinMiddleWare(db, cache))
	app.Use(ThrottleMiddleware())
	app.Use(AuthMiddleware())

	return func() {
		db.Close()
		cache.Close()
	}
}
