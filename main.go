package main

import (
	"chat/api"
	"chat/auth"
	"chat/connection"
	"chat/conversation"
	"chat/generation"
	"chat/middleware"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigFile("config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}

	app := gin.Default()
	{
		app.Use(middleware.CORSMiddleware())
		app.Use(middleware.BuiltinMiddleWare(connection.ConnectMySQL(), connection.ConnectRedis()))
		app.Use(middleware.ThrottleMiddleware())
		app.Use(auth.Middleware())

		app.POST("/anonymous", api.AnonymousAPI)
		app.POST("/card", api.CardAPI)
		app.GET("/chat", api.ChatAPI)
		app.POST("/login", auth.LoginAPI)
		app.POST("/state", auth.StateAPI)
		app.GET("/package", auth.PackageAPI)
		app.GET("/quota", auth.QuotaAPI)
		app.POST("/buy", auth.BuyAPI)
		app.GET("/subscription", auth.SubscriptionAPI)
		app.POST("/subscribe", auth.SubscribeAPI)
		app.GET("/conversation/list", conversation.ListAPI)
		app.GET("/conversation/load", conversation.LoadAPI)
		app.GET("/conversation/delete", conversation.DeleteAPI)
		app.GET("/generation/create", generation.GenerateAPI)
		app.GET("/generation/download/tar", generation.ProjectTarDownloadAPI)
		app.GET("/generation/download/zip", generation.ProjectZipDownloadAPI)
	}
	if viper.GetBool("debug") {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	if err := app.Run(":" + viper.GetString("server.port")); err != nil {
		panic(err)
	}
}
