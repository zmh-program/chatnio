package utils

import (
	"chat/globals"
	"fmt"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"strings"
)

var configFile = "config/config.yaml"
var configExampleFile = "config.example.yaml"

var redirectRoutes = []string{
	"/v1",
	"/mj",
}

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
	if viper.GetBool("debug") {
		return gin.Default()
	}

	gin.SetMode(gin.ReleaseMode)

	engine := gin.New()
	engine.Use(gin.Recovery())
	return engine
}

func ApplySeo(title, icon string) {
	// seo optimization

	if !viper.GetBool("serve_static") {
		return
	}

	content, err := ReadFile("./app/dist/index.html")
	if err != nil {
		globals.Warn(fmt.Sprintf("[service] failed to read index.html: %s", err.Error()))
		return
	}

	if len(title) > 0 {
		content = strings.ReplaceAll(content, "Chat Nio", title)
		content = strings.ReplaceAll(content, "chatnio", strings.ToLower(title))
	}

	if len(icon) > 0 {
		content = strings.ReplaceAll(content, "/favicon.ico", icon)
	}

	if err := WriteFile("./app/dist/index.cache.html", content, true); err != nil {
		globals.Warn(fmt.Sprintf("[service] failed to write index.cache.html: %s", err.Error()))
	}

	globals.Info("[service] seo optimization applied to index.cache.html")
}

func RegisterStaticRoute(engine *gin.Engine) {
	// static files are in ~/app/dist

	if !viper.GetBool("serve_static") {
		engine.NoRoute(func(c *gin.Context) {
			c.JSON(404, gin.H{"status": false, "message": "not found or method not allowed"})
		})
		return
	}

	if !IsFileExist("./app/dist") {
		fmt.Println("[service] app/dist not found, please run `npm run build`")
		return
	}

	ApplySeo(viper.GetString("system.general.title"), viper.GetString("system.general.logo"))

	// serve / -> index.cache.html
	engine.GET("/", func(c *gin.Context) {
		c.File("./app/dist/index.cache.html")
	})
	engine.Use(static.Serve("/", static.LocalFile("./app/dist", true)))
	engine.NoRoute(func(c *gin.Context) {
		c.File("./app/dist/index.cache.html")
	})

	for _, route := range redirectRoutes {
		engine.Any(fmt.Sprintf("%s/*path", route), func(c *gin.Context) {
			path := c.Param("path")
			c.Redirect(301, fmt.Sprintf("/api%s/%s", route, path))
		})
	}

	fmt.Println(`[service] start serving static files from ~/app/dist`)
}
