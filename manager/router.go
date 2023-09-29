package manager

import "github.com/gin-gonic/gin"

func Register(app *gin.Engine) {
	app.GET("/chat", ChatAPI)
}
