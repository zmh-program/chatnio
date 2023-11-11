package manager

import (
	"chat/auth"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

type BillingResponse struct {
	Object     string  `json:"object"`
	TotalUsage float32 `json:"total_usage"`
}

type SubscriptionResponse struct {
	Object             string  `json:"object"`
	SoftLimit          int64   `json:"soft_limit"`
	HardLimit          int64   `json:"hard_limit"`
	SystemHardLimit    int64   `json:"system_hard_limit"`
	SoftLimitUSD       float32 `json:"soft_limit_usd"`
	HardLimitUSD       float32 `json:"hard_limit_usd"`
	SystemHardLimitUSD float32 `json:"system_hard_limit_usd"`
}

func GetBillingUsage(c *gin.Context) {
	user := auth.RequireAuth(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	usage := user.GetUsedQuota(db)

	c.JSON(http.StatusOK, BillingResponse{
		Object:     "list",
		TotalUsage: usage,
	})
}

func GetSubscription(c *gin.Context) {
	user := auth.RequireAuth(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	quota := user.GetQuota(db)
	used := user.GetUsedQuota(db)
	total := quota + used

	c.JSON(http.StatusOK, SubscriptionResponse{
		Object:             "billing_subscription",
		SoftLimit:          int64(quota * 100),
		HardLimit:          int64(total * 100),
		SystemHardLimit:    100000000,
		SoftLimitUSD:       quota / 7.3 / 10,
		HardLimitUSD:       total / 7.3 / 10,
		SystemHardLimitUSD: 1000000,
	})
}
