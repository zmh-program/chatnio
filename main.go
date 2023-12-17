package main

import (
	"chat/adapter"
	"chat/addition"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/cli"
	"chat/manager"
	"chat/manager/conversation"
	"chat/middleware"
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
	channel.InitManager()

	app := gin.New()
	middleware.RegisterMiddleware(app)

	{
		auth.Register(app)
		admin.Register(app)
		adapter.Register(app)
		manager.Register(app)
		addition.Register(app)
		conversation.Register(app)
	}

	if viper.GetBool("debug") {
		app.Use(gin.Logger())
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	app.Use(gin.Recovery())

	if err := app.Run(fmt.Sprintf(":%s", viper.GetString("server.port"))); err != nil {
		panic(err)
	}
}
