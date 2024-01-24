package admin

import (
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

type GenerateInvitationForm struct {
	Type   string  `json:"type"`
	Quota  float32 `json:"quota"`
	Number int     `json:"number"`
}

type GenerateRedeemForm struct {
	Quota  float32 `json:"quota"`
	Number int     `json:"number"`
}

type QuotaOperationForm struct {
	Id    int64   `json:"id"`
	Quota float32 `json:"quota"`
}

type SubscriptionOperationForm struct {
	Id    int64 `json:"id"`
	Month int64 `json:"month"`
}

type UpdateRootPasswordForm struct {
	Password string `json:"password"`
}

func UpdateMarketAPI(c *gin.Context) {
	var form MarketModelList
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	err := MarketInstance.SetModels(form)
	if err != nil {
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

func InfoAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	c.JSON(http.StatusOK, InfoForm{
		SubscriptionCount: GetSubscriptionUsers(db),
		BillingToday:      GetBillingToday(cache),
		BillingMonth:      GetBillingMonth(cache),
	})
}

func ModelAnalysisAPI(c *gin.Context) {
	cache := utils.GetCacheFromContext(c)
	c.JSON(http.StatusOK, GetSortedModelData(cache))
}

func RequestAnalysisAPI(c *gin.Context) {
	cache := utils.GetCacheFromContext(c)
	c.JSON(http.StatusOK, GetRequestData(cache))
}

func BillingAnalysisAPI(c *gin.Context) {
	cache := utils.GetCacheFromContext(c)
	c.JSON(http.StatusOK, GetBillingData(cache))
}

func ErrorAnalysisAPI(c *gin.Context) {
	cache := utils.GetCacheFromContext(c)
	c.JSON(http.StatusOK, GetErrorData(cache))
}

func UserTypeAnalysisAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)
	if form, err := GetUserTypeData(db); err != nil {
		c.JSON(http.StatusOK, &UserTypeForm{})
	} else {
		c.JSON(http.StatusOK, form)
	}
}

func RedeemListAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)
	c.JSON(http.StatusOK, GetRedeemData(db))
}

func InvitationPaginationAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	page, _ := strconv.Atoi(c.Query("page"))
	c.JSON(http.StatusOK, GetInvitationPagination(db, int64(page)))
}

func GenerateInvitationAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	var form GenerateInvitationForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, GenerateInvitations(db, form.Number, form.Quota, form.Type))
}

func GenerateRedeemAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	var form GenerateRedeemForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, GenerateRedeemCodes(db, form.Number, form.Quota))
}

func UserPaginationAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	page, _ := strconv.Atoi(c.Query("page"))
	search := strings.TrimSpace(c.Query("search"))
	c.JSON(http.StatusOK, GetUserPagination(db, int64(page), search))
}

func UserQuotaAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	var form QuotaOperationForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	err := QuotaOperation(db, form.Id, form.Quota)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
	})
}

func UserSubscriptionAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	var form SubscriptionOperationForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	err := SubscriptionOperation(db, form.Id, form.Month)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": true,
	})
}

func UpdateRootPasswordAPI(c *gin.Context) {
	var form UpdateRootPasswordForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
		return
	}

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	err := UpdateRootPassword(db, cache, form.Password)
	if err != nil {
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

func ListLoggerAPI(c *gin.Context) {
	c.JSON(http.StatusOK, ListLogs())
}

func DownloadLoggerAPI(c *gin.Context) {
	path := c.Query("path")
	getBlobFile(c, path)
}

func DeleteLoggerAPI(c *gin.Context) {
	path := c.Query("path")
	if err := deleteLogFile(path); err != nil {
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

func ConsoleLoggerAPI(c *gin.Context) {
	n := utils.ParseInt(c.Query("n"))

	content := getLatestLogs(n)

	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"content": content,
	})
}
