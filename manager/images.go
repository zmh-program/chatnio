package manager

import (
	adaptercommon "chat/adapter/common"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func ImagesRelayAPI(c *gin.Context) {
	if globals.CloseRelay {
		abortWithErrorResponse(c, fmt.Errorf("relay api is denied of access"), "access_denied_error")
		return
	}

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
	if check != nil {
		sendErrorResponse(c, check, "quota_exceeded_error")
		return
	}

	createRelayImageObject(c, form, prompt, created, user, supportRelayPlan())
}

func getImageProps(form RelayImageForm, messages []globals.Message, buffer *utils.Buffer) *adaptercommon.ChatProps {
	return adaptercommon.CreateChatProps(&adaptercommon.ChatProps{
		Model:     form.Model,
		Message:   messages,
		MaxTokens: utils.ToPtr(-1),
	}, buffer)
}

func getUrlFromBuffer(buffer *utils.Buffer) string {
	content := buffer.Read()

	urls := utils.ExtractImagesFromMarkdown(content)
	if len(urls) > 0 {
		return urls[len(urls)-1]
	}

	return ""
}

func createRelayImageObject(c *gin.Context, form RelayImageForm, prompt string, created int64, user *auth.User, plan bool) {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	messages := []globals.Message{
		{
			Role:    globals.User,
			Content: prompt,
		},
	}

	buffer := utils.NewBuffer(form.Model, messages, channel.ChargeInstance.GetCharge(form.Model))
	hit, err := channel.NewChatRequestWithCache(cache, buffer, auth.GetGroup(db, user), getImageProps(form, messages, buffer), func(data *globals.Chunk) error {
		buffer.WriteChunk(data)
		return nil
	})

	admin.AnalyseRequest(form.Model, buffer, err)
	if err != nil {
		auth.RevertSubscriptionUsage(db, cache, user, form.Model)
		globals.Warn(fmt.Sprintf("error from chat request api: %s (instance: %s, client: %s)", err, form.Model, c.ClientIP()))

		sendErrorResponse(c, err)
		return
	}

	if !hit {
		CollectQuota(c, user, buffer, plan, err)
	}

	image := getUrlFromBuffer(buffer)
	if image == "" {
		sendErrorResponse(c, fmt.Errorf("no image generated"), "image_generation_error")
		return
	}

	c.JSON(http.StatusOK, RelayImageResponse{
		Created: created,
		Data: []RelayImageData{
			{
				Url: image,
			},
		},
	})
}
