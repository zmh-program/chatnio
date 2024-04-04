package auth

import (
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type RegisterForm struct {
	Username string `form:"username" binding:"required"`
	Password string `form:"password" binding:"required"`
	Email    string `form:"email" binding:"required"`
	Code     string `form:"code"`
}

type VerifyForm struct {
	Email    string `form:"email" binding:"required"`
	Checkout bool   `form:"checkout"`
}

type LoginForm struct {
	Username string `form:"username" binding:"required"`
	Password string `form:"password" binding:"required"`
}

type DeepLoginForm struct {
	Token string `form:"token" binding:"required"`
}

type ResetForm struct {
	Email    string `form:"email" binding:"required"`
	Code     string `form:"code" binding:"required"`
	Password string `form:"password" binding:"required"`
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

func RegisterAPI(c *gin.Context) {
	if useDeeptrain() {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "this api is not available for deeptrain mode",
		})
		return
	}

	if globals.CloseRegistration {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "this site is not open for registration",
		})
		return
	}

	var form RegisterForm
	if err := c.ShouldBind(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "bad request",
		})
		return
	}

	token, err := SignUp(c, form)
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

func LoginAPI(c *gin.Context) {
	var token string
	var err error

	if useDeeptrain() {
		var form DeepLoginForm
		if err := c.ShouldBind(&form); err != nil {
			c.JSON(http.StatusOK, gin.H{
				"status": false,
				"error":  "bad request",
			})
			return
		}

		token, err = DeepLogin(c, form.Token)
	} else {
		var form LoginForm
		if err := c.ShouldBind(&form); err != nil {
			c.JSON(http.StatusOK, gin.H{
				"status": false,
				"error":  "bad request",
			})
			return
		}

		token, err = Login(c, form)
	}

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

func VerifyAPI(c *gin.Context) {
	var form VerifyForm
	if err := c.ShouldBind(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "bad request",
		})
		return
	}

	if err := Verify(c, form.Email, form.Checkout); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
	})
}

func ResetAPI(c *gin.Context) {
	var form ResetForm
	if err := c.ShouldBind(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "bad request",
		})
		return
	}

	if err := Reset(c, form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
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

func IndexAPI(c *gin.Context) {
	username := utils.GetUserFromContext(c)

	c.JSON(http.StatusOK, gin.H{
		"status": true,
		"auth":   len(username) != 0,
		"method": c.Request.Method,
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

func ResetKeyAPI(c *gin.Context) {
	user := GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "user not found",
		})
		return
	}

	if key, err := user.ResetApiKey(utils.GetDBFromContext(c)); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status": true,
			"key":    key,
		})
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
	cache := utils.GetCacheFromContext(c)

	if disableSubscription() {
		c.JSON(200, gin.H{
			"status":        true,
			"level":         0,
			"is_subscribed": false,
			"enterprise":    false,
			"expired":       0,
			"usage":         channel.UsageMap{},
		})
	}

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

	if err := BuySubscription(db, cache, user, form.Level, form.Month); err == nil {
		c.JSON(200, gin.H{
			"status": true,
			"error":  "success",
		})
	} else {
		c.JSON(200, gin.H{
			"status": false,
			"error":  err.Error(),
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

	if err := BuyQuota(db, cache, user, form.Quota); err == nil {
		c.JSON(200, gin.H{
			"status": true,
			"error":  "success",
		})
	} else {
		c.JSON(200, gin.H{
			"status": false,
			"error":  err.Error(),
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

func RedeemAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	code := strings.TrimSpace(c.Query("code"))
	if len(code) == 0 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "invalid code",
			"quota":  0.,
		})
		return
	}

	if quota, err := user.UseRedeem(db, cache, code); err != nil {
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
