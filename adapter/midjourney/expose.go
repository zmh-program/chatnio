package midjourney

import (
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

func InWhiteList(ip string) bool {
	arr := strings.Split(viper.GetString("midjourney.white_list"), ",")
	return utils.Contains[string](ip, arr)
}

func NotifyAPI(c *gin.Context) {
	if !InWhiteList(c.ClientIP()) {
		fmt.Println(fmt.Sprintf("[midjourney] notify api: banned request from %s", c.ClientIP()))
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	var form NotifyForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	// fmt.Println(fmt.Sprintf("[midjourney] notify api: get notify: %s (from: %s)", utils.Marshal(form), c.ClientIP()))

	if !utils.Contains(form.Status, []string{InProgress, Success, Failure}) {
		// ignore
		return
	}

	reason, ok := form.FailReason.(string)
	if !ok {
		reason = "unknown"
	}

	err := setStorage(form.Id, StorageForm{
		Url:        form.ImageUrl,
		FailReason: reason,
		Progress:   form.Progress,
		Status:     form.Status,
	})

	c.JSON(http.StatusOK, gin.H{
		"status": err == nil,
	})
}
