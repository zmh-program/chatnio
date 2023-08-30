package auth

import (
	"chat/utils"
	"database/sql"
	"github.com/gin-gonic/gin"
)

type BuyForm struct {
	Type  string `json:"type" binding:"required"`
	Quota int    `json:"quota" binding:"required"`
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

func GetUsageAPI(c *gin.Context) {
	user := GetUserByCtx(c)
	if user == nil {
		return
	}

	db := utils.GetDBFromContext(c)
	c.JSON(200, gin.H{
		"status":  true,
		"data":    UsageAPI(db, user),
		"balance": GetBalance(user.Username),
	})
}

func PayResponse(c *gin.Context, db *sql.DB, user *User, state bool) {
	if state {
		c.JSON(200, gin.H{
			"status": true,
			"data":   UsageAPI(db, user),
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

	if form.Quota <= 0 || form.Quota > 50000 {
		c.JSON(200, gin.H{
			"status": false,
			"error":  "invalid quota range (1 ~ 50000)",
,		})
		return
	}

	if form.Type == "dalle" {
		PayResponse(c, db, user, BuyDalle(db, user, form.Quota))
	} else if form.Type == "gpt4" {
		PayResponse(c, db, user, BuyGPT4(db, user, form.Quota))
	} else {
		c.JSON(200, gin.H{"status": false, "error": "unknown type"})
	}
}
