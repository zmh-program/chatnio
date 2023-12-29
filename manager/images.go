package manager

import (
	"chat/auth"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
	"time"
)

func ImagesRelayAPI(c *gin.Context) {
	username := utils.GetUserFromContext(c)
	if username == "" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid api key"), "authentication_error")
		return
	}

	if utils.GetAgentFromContext(c) != "api" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid agent"), "authentication_error")
		return
	}

	var form RelayImageForm
	if err := c.ShouldBindJSON(&form); err != nil {
		abortWithErrorResponse(c, fmt.Errorf("invalid request body: %s", err.Error()), "invalid_request_error")
		return
	}

	prompt := strings.TrimSpace(form.Prompt)
	if prompt == "" {
		sendErrorResponse(c, fmt.Errorf("prompt is required"), "invalid_request_error")
	}

	db := utils.GetDBFromContext(c)
	user := &auth.User{
		Username: username,
	}

	created := time.Now().Unix()

	if strings.HasSuffix(form.Model, "-official") {
		form.Model = strings.TrimSuffix(form.Model, "-official")
	}

	check := auth.CanEnableModel(db, user, form.Model)
	if !check {
		sendErrorResponse(c, fmt.Errorf("quota exceeded"), "quota_exceeded_error")
		return
	}

	createRelayImageObject(c, form, prompt, created, user, false)
}

func createRelayImageObject(c *gin.Context, form RelayImageForm, prompt string, created int64, user *auth.User, plan bool) {

}
