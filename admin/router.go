package admin

import (
	"chat/addition/web"
	"chat/channel"

	"github.com/gin-gonic/gin"
)

func Register(app *gin.RouterGroup) {
	channel.Register(app)

	app.GET("/admin/config/test/search", web.TestSearch)

	app.GET("/admin/analytics/info", InfoAPI)
	app.GET("/admin/analytics/model", ModelAnalysisAPI)
	app.GET("/admin/analytics/request", RequestAnalysisAPI)
	app.GET("/admin/analytics/billing", BillingAnalysisAPI)
	app.GET("/admin/analytics/error", ErrorAnalysisAPI)
	app.GET("/admin/analytics/user", UserTypeAnalysisAPI)

	app.GET("/admin/invitation/list", InvitationPaginationAPI)
	app.POST("/admin/invitation/generate", GenerateInvitationAPI)
	app.POST("/admin/invitation/delete", DeleteInvitationAPI)

	app.GET("/admin/redeem/list", RedeemListAPI)
	app.POST("/admin/redeem/generate", GenerateRedeemAPI)
	app.POST("/admin/redeem/delete", DeleteRedeemAPI)

	app.GET("/admin/user/list", UserPaginationAPI)
	app.POST("/admin/user/quota", UserQuotaAPI)
	app.POST("/admin/user/subscription", UserSubscriptionAPI)
	app.POST("/admin/user/level", SubscriptionLevelAPI)
	app.POST("/admin/user/release", ReleaseUsageAPI)
	app.POST("/admin/user/password", UpdatePasswordAPI)
	app.POST("/admin/user/email", UpdateEmailAPI)
	app.POST("/admin/user/ban", BanAPI)
	app.POST("/admin/user/admin", SetAdminAPI)
	app.POST("/admin/user/root", UpdateRootPasswordAPI)

	app.POST("/admin/market/update", UpdateMarketAPI)

	app.GET("/admin/logger/list", ListLoggerAPI)
	app.GET("/admin/logger/download", DownloadLoggerAPI)
	app.GET("/admin/logger/console", ConsoleLoggerAPI)
	app.POST("/admin/logger/delete", DeleteLoggerAPI)
}
