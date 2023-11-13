package adapter

import (
	"chat/adapter/midjourney"
	"github.com/gin-gonic/gin"
)

func Register(app *gin.Engine) {
	app.POST("/mj/notify", midjourney.NotifyAPI)
}
