package manager

import (
	"chat/admin"
	"chat/channel"
	"chat/globals"
	"github.com/gin-gonic/gin"
	"net/http"
)

func ModelAPI(c *gin.Context) {
	c.JSON(http.StatusOK, globals.V1ListModels)
}

func MarketAPI(c *gin.Context) {
	c.JSON(http.StatusOK, admin.MarketInstance.GetModels())
}

func ChargeAPI(c *gin.Context) {
	c.JSON(http.StatusOK, channel.ChargeInstance.ListRules())
}

func PlanAPI(c *gin.Context) {
	c.JSON(http.StatusOK, channel.PlanInstance.GetPlans())
}

func sendErrorResponse(c *gin.Context, err error, types ...string) {
	var errType string
	if len(types) > 0 {
		errType = types[0]
	} else {
		errType = "chatnio_api_error"
	}

	c.JSON(http.StatusServiceUnavailable, RelayErrorResponse{
		Error: TranshipmentError{
			Message: err.Error(),
			Type:    errType,
		},
	})
}

func abortWithErrorResponse(c *gin.Context, err error, types ...string) {
	sendErrorResponse(c, err, types...)
	c.Abort()
}
