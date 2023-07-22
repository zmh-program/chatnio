package main

import (
	"chat/api"
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
	connection.ConnectRedis()
	connection.ConnectMySQL()

	app := gin.Default()
	{
		app.Use(middleware.CORSMiddleware())
		app.Use(middleware.BuiltinMiddleWare(connection.Database, connection.Cache))
		app.Use(middleware.ThrottleMiddleware())

		app.POST("/api/anonymous", api.AnonymousAPI)
	}
	if err := app.Run(":" + viper.GetString("server.port")); err != nil {
		panic(err)
	}
}
