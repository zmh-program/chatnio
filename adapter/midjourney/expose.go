package midjourney

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

var whiteList []string

func SaveWhiteList(raw string) {
	arr := utils.Filter(strings.Split(raw, ","), func(s string) bool {
		return len(strings.TrimSpace(s)) > 0
	})

	for _, ip := range arr {
		if !utils.Contains(ip, whiteList) {
			whiteList = append(whiteList, ip)
		}
	}
}

func InWhiteList(ip string) bool {
	if len(whiteList) == 0 {
		return true
	}
	return utils.Contains(ip, whiteList)
}

func NotifyAPI(c *gin.Context) {
	if !InWhiteList(c.ClientIP()) {
		globals.Info(fmt.Sprintf("[midjourney] notify api: banned request from %s", c.ClientIP()))
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	var form NotifyForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	globals.Debug(fmt.Sprintf("[midjourney] notify api: get notify: %s (from: %s)", utils.Marshal(form), c.ClientIP()))

	if !utils.Contains(form.Status, []string{InProgress, Success, Failure}) {
		// ignore
		return
	}

	reason, ok := form.FailReason.(string)
	if !ok {
		reason = "unknown"
	}

	err := setStorage(form.Id, StorageForm{
		Task:       form.Id,
		Action:     form.Action,
		Url:        form.ImageUrl,
		FailReason: reason,
		Progress:   form.Progress,
		Status:     form.Status,
	})

	c.JSON(http.StatusOK, gin.H{
		"status": err == nil,
	})
}
