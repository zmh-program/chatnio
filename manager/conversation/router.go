package conversation

import "github.com/gin-gonic/gin"

func Register(app *gin.Engine) {
	router := app.Group("/conversation")
	{
		router.GET("/list", ListAPI)
		router.GET("/load", LoadAPI)
		router.GET("/delete", DeleteAPI)
	}
}
