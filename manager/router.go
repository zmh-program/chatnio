package manager

import (
	"chat/manager/broadcast"
	"github.com/gin-gonic/gin"
)

func Register(app *gin.RouterGroup) {
	app.GET("/chat", ChatAPI)
	app.GET("/v1/models", ModelAPI)
	app.GET("/v1/market", MarketAPI)
	app.GET("/v1/charge", ChargeAPI)
	app.GET("/v1/plans", PlanAPI)
	app.GET("/dashboard/billing/usage", GetBillingUsage)
	app.GET("/dashboard/billing/subscription", GetSubscription)
	app.POST("/v1/chat/completions", ChatRelayAPI)
	app.POST("/v1/images/generations", ImagesRelayAPI)

	broadcast.Register(app)
}
