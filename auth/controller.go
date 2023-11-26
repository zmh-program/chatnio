package auth

import (
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

type LoginForm struct {
	Token string `form:"token" binding:"required"`
}

type BuyForm struct {
	Quota int `json:"quota" binding:"required"`
}

type SubscribeForm struct {
	Level int `json:"level" binding:"required"`
	Month int `json:"month" binding:"required"`
}

func GetUser(c *gin.Context) *User {
	if c.GetBool("auth") {
		return &User{
			Username: c.GetString("user"),
		}
	}
	return nil
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

func RequireAuth(c *gin.Context) *User {
	user := GetUserByCtx(c)
	if user == nil {
		c.Abort()
		return nil
	}

	return user
}

func RequireAdmin(c *gin.Context) *User {
	user := RequireAuth(c)
	if user == nil {
		return nil
	}

	db := utils.GetDBFromContext(c)
	if !user.IsAdmin(db) {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "admin required",
		})
		c.Abort()
		return nil
	}

	return user
}

func RequireSubscription(c *gin.Context) *User {
	user := RequireAuth(c)
	if user == nil {
		return nil
	}

	db := utils.GetDBFromContext(c)
	if !user.IsSubscribe(db) {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "subscription required",
		})
		c.Abort()
		return nil
	}

	return user
}

func RequireEnterprise(c *gin.Context) *User {
	user := RequireAuth(c)
	if user == nil {
		return nil
	}

	db := utils.GetDBFromContext(c)
	if !user.IsEnterprise(db) {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "enterprise required",
		})
		c.Abort()
		return nil
	}

	return user
}

func LoginAPI(c *gin.Context) {
	var form LoginForm
	if err := c.ShouldBind(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "bad request",
		})
		return
	}

	token, err := Login(c, form.Token)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
		"token":  token,
	})
}

func StateAPI(c *gin.Context) {
	username := utils.GetUserFromContext(c)
	c.JSON(http.StatusOK, gin.H{
		"status": len(username) != 0,
		"user":   username,
		"admin":  utils.GetAdminFromContext(c),
	})
}

func KeyAPI(c *gin.Context) {
	user := GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
		"key":    user.GetApiKey(utils.GetDBFromContext(c)),
	})
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
	cache := utils.GetCacheFromContext(c)
	c.JSON(200, gin.H{
		"status":        true,
		"level":         user.GetSubscriptionLevel(db),
		"is_subscribed": user.IsSubscribe(db),
		"enterprise":    user.IsEnterprise(db),
		"expired":       user.GetSubscriptionExpiredDay(db),
		"usage":         user.GetSubscriptionUsage(db, cache),
	})
}

func SubscribeAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
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

	if BuySubscription(db, cache, user, form.Level, form.Month) {
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
	cache := utils.GetCacheFromContext(c)
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

	if BuyQuota(db, cache, user, form.Quota) {
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
