package auth

import "github.com/gin-gonic/gin"

func Register(app *gin.Engine) {
	app.POST("/login", LoginAPI)
	app.POST("/state", StateAPI)
	app.GET("/apikey", KeyAPI)
	app.GET("/package", PackageAPI)
	app.GET("/quota", QuotaAPI)
	app.POST("/buy", BuyAPI)
	app.GET("/subscription", SubscriptionAPI)
	app.POST("/subscribe", SubscribeAPI)
}
