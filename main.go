package main

import (
	"chat/api"
	"chat/auth"
	"chat/connection"
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
		app.GET("/chat", api.ChatAPI)
		app.POST("/login", auth.LoginAPI)
		app.POST("/state", auth.StateAPI)

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
