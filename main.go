package main

import (
	"chat/adapter"
	"chat/addition"
	"chat/admin"
	"chat/auth"
	"chat/cli"
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
	if cli.Run() {
		return
	}

	app := gin.Default()
	middleware.RegisterMiddleware(app)

	{
		auth.Register(app)
		admin.Register(app)
		adapter.Register(app)
		manager.Register(app)
		addition.Register(app)
		conversation.Register(app)
	}

	gin.SetMode(utils.Multi[string](viper.GetBool("debug"), gin.DebugMode, gin.ReleaseMode))
	if err := app.Run(fmt.Sprintf(":%s", viper.GetString("server.port"))); err != nil {
		panic(err)
	}
}
