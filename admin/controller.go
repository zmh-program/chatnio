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
	c.JSON(http.StatusOK, GetModelData(cache))
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

func UserPaginationAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)

	page, _ := strconv.Atoi(c.Query("page"))
	search := strings.TrimSpace(c.Query("search"))
	c.JSON(http.StatusOK, GetUserPagination(db, int64(page), search))
}
