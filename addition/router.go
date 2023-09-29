package addition

import (
	"chat/addition/card"
	"chat/addition/generation"
	"github.com/gin-gonic/gin"
)

func Register(app *gin.Engine) {
	{
		app.POST("/card", card.HandlerAPI)

		app.GET("/generation/create", generation.GenerateAPI)
		app.GET("/generation/download/tar", generation.ProjectTarDownloadAPI)
		app.GET("/generation/download/zip", generation.ProjectZipDownloadAPI)
	}
}
