package main

import (
	"chat/addition"
	"chat/auth"
	"chat/manager"
	"chat/manager/conversation"
	"chat/middleware"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigFile("config.yaml")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}

	app := gin.Default()
	middleware.RegisterMiddleware(app)

	{
		auth.Register(app)
		manager.Register(app)
		addition.Register(app)
		conversation.Register(app)
	}

	gin.SetMode(utils.Multi[string](viper.GetBool("debug"), gin.DebugMode, gin.ReleaseMode))
	if err := app.Run(fmt.Sprintf(":%s", viper.GetString("server.port"))); err != nil {
		panic(err)
	}
}
