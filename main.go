package main

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigFile("config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}
	ConnectRedis()

	app := gin.Default()
	{
		app.POST("/api/anonymous", AnonymousAPI)
	}
	if err := app.Run(":" + viper.GetString("server.port")); err != nil {
		panic(err)
	}
}
