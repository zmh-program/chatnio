package broadcast

import (
	"chat/auth"
	"github.com/gin-gonic/gin"
	"net/http"
)

func ViewBroadcastAPI(c *gin.Context) {
	c.JSON(http.StatusOK, getLatestBroadcast(c))
}

func CreateBroadcastAPI(c *gin.Context) {
	user := auth.RequireAdmin(c)
	if user == nil {
		return
	}

	var form createRequest
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, createResponse{
			Status: false,
			Error:  err.Error(),
		})
	}

	err := createBroadcast(c, user, form.Content)
	if err != nil {
		c.JSON(http.StatusOK, createResponse{
			Status: false,
			Error:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, createResponse{
		Status: true,
	})
}

func GetBroadcastListAPI(c *gin.Context) {
	user := auth.RequireAdmin(c)
	if user == nil {
		return
	}

	data, err := getBroadcastList(c)
	if err != nil {
		c.JSON(http.StatusOK, listResponse{
			Data: []Info{},
		})
		return
	}

	c.JSON(http.StatusOK, listResponse{
		Data: data,
	})
}
