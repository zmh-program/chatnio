package utils

import (
	"fmt"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"strings"
)

var configFile = "config.yaml"
var configExampleFile = "config.example.yaml"

func ReadConf() {
	viper.SetConfigFile(configFile)

	if !IsFileExist(configFile) {
		fmt.Println(fmt.Sprintf("[service] config.yaml not found, creating one from template: %s", configExampleFile))
		if err := CopyFile(configExampleFile, configFile); err != nil {
			fmt.Println(err)
		}
	}

	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
}

func NewEngine() *gin.Engine {
	engine := gin.New()

	if viper.GetBool("debug") {
		engine.Use(gin.Logger())
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	engine.Use(gin.Recovery())

	return engine
}

func RegisterStaticRoute(engine *gin.Engine) {
	// static files are in ~/app/dist

	if !viper.GetBool("serve_static") {
		return
	}

	if !IsFileExist("./app/dist") {
		fmt.Println("[service] app/dist not found, please run `npm run build`")
		return
	}

	engine.Use(static.Serve("/", static.LocalFile("./app/dist", true)))
	engine.NoRoute(func(c *gin.Context) {
		c.File("./app/dist/index.html")
	})
}
