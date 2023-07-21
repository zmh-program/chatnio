package main

import (
	"chat/api"
	"chat/connection"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigFile("config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}
	connection.ConnectRedis()

	app := gin.Default()
	{
		app.POST("/api/anonymous", api.AnonymousAPI)
	}
	if err := app.Run(":" + viper.GetString("server.port")); err != nil {
		panic(err)
	}
}
