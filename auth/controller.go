package auth

import (
	"chat/utils"
	"github.com/gin-gonic/gin"
	"strings"
)

type BuyForm struct {
	Quota int `json:"quota" binding:"required"`
}

type SubscribeForm struct {
	Month int `json:"month" binding:"required"`
}

func GetUserByCtx(c *gin.Context) *User {
	user := utils.GetUserFromContext(c)
	if len(user) == 0 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "user not found",
		})
		return nil
	}

	return &User{
		Username: user,
	}
}

func PackageAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	c.JSON(200, gin.H{
		"status": true,
		"data":   RefreshPackage(db, user),
	})
}

func QuotaAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	c.JSON(200, gin.H{
		"status": true,
		"quota":  user.GetQuota(db),
	})
}

func SubscriptionAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	c.JSON(200, gin.H{
		"status":        true,
		"is_subscribed": user.IsSubscribe(db),
		"expired":       user.GetSubscriptionExpiredDay(db),
	})
}

func SubscribeAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	var form SubscribeForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	if form.Month <= 0 || form.Month > 999 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "invalid month range (1 ~ 999)",
		})
		return
	}

	if BuySubscription(db, user, form.Month) {
		c.JSON(200, gin.H{
			"status": true,
			"error":  "success",
		})
	} else {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "not enough money",
		})
	}
}

func BuyAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	var form BuyForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	if form.Quota <= 0 || form.Quota > 99999 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "invalid quota range (1 ~ 99999)",
		})
		return
	}

	if BuyQuota(db, user, form.Quota) {
		c.JSON(200, gin.H{
			"status": true,
			"error":  "success",
		})
	} else {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "not enough money",
		})
	}
}

func InviteAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	code := strings.TrimSpace(c.Query("code"))
	if len(code) == 0 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "invalid code",
			"quota":  0.,
		})
		return
	}

	if quota, err := user.UseInvitation(db, code); err != nil {
		c.JSON(200, gin.H{
			"status": false,
			"error":  err.Error(),
			"quota":  0.,
		})
		return
	} else {
		c.JSON(200, gin.H{
			"status": true,
			"error":  "success",
			"quota":  quota,
		})
	}
}
