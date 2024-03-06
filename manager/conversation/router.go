package conversation

import "github.com/gin-gonic/gin"

func Register(app *gin.RouterGroup) {
	router := app.Group("/conversation")
	{
		router.GET("/list", ListAPI)
		router.GET("/load", LoadAPI)
		router.POST("/rename", RenameAPI)
		router.GET("/delete", DeleteAPI)
		router.GET("/clean", CleanAPI)

		// share
		router.POST("/share", ShareAPI)
		router.GET("/view", ViewAPI)
		router.GET("/share/list", ListSharingAPI)
		router.GET("/share/delete", DeleteSharingAPI)

		router.GET("/mask/view", LoadMaskAPI)
		router.POST("/mask/save", SaveMaskAPI)
		router.POST("/mask/delete", DeleteMaskAPI)
	}
}
