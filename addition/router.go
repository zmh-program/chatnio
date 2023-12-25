package addition

import (
	"chat/addition/article"
	"chat/addition/card"
	"chat/addition/generation"
	"github.com/gin-gonic/gin"
)

func Register(app *gin.RouterGroup) {
	{
		app.POST("/card", card.HandlerAPI)

		app.GET("/generation/create", generation.GenerateAPI)
		app.GET("/generation/download/tar", generation.ProjectTarDownloadAPI)
		app.GET("/generation/download/zip", generation.ProjectZipDownloadAPI)

		app.GET("/article/create", article.GenerateAPI)
		app.GET("/article/download/tar", article.ProjectTarDownloadAPI)
		app.GET("/article/download/zip", article.ProjectZipDownloadAPI)
	}
}
