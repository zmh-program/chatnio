package main

import (
	"chat/adapter/chatgpt"
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

	fmt.Println(chatgpt.FilterKeys("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|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|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|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|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|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|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|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|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|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|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"))
	return
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
