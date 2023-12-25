package conversation

import "github.com/gin-gonic/gin"

func Register(app *gin.RouterGroup) {
	router := app.Group("/conversation")
	{
		router.GET("/list", ListAPI)
		router.GET("/load", LoadAPI)
		router.GET("/delete", DeleteAPI)
		router.GET("/clean", CleanAPI)

		// share
		router.POST("/share", ShareAPI)
		router.GET("/view", ViewAPI)
		router.GET("/share/list", ListSharingAPI)
		router.GET("/share/delete", DeleteSharingAPI)
	}
}
