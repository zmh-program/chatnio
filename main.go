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
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	utils.ReadConf()
	channel.InitManager()

	if cli.Run() {
		return
	}

	app := gin.New()
	worker := middleware.RegisterMiddleware(app)
	defer worker()

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
