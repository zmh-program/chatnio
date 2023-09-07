package auth

import (
	"chat/utils"
	"github.com/gin-gonic/gin"
)

type BuyForm struct {
	Quota int `json:"quota" binding:"required"`
}

func GetUserByCtx(c *gin.Context) *User {
	user := c.MustGet("user").(string)
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

	money := float32(form.Quota) * 0.1
	if Pay(user.Username, float32(money)*0.1) {
		c.JSON(200, gin.H{
			"status": true,
			"data":   user.GetQuota(db),
		})
	} else {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "not enough money",
		})
	}
}
