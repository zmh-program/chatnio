package manager

import "github.com/gin-gonic/gin"

func Register(app *gin.Engine) {
	app.GET("/chat", ChatAPI)
	app.GET("/v1/chat/models", ModelAPI)
	app.POST("/v1/chat/completions", TranshipmentAPI)
}
