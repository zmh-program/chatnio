package manager

import (
	"chat/adapter"
	"chat/addition/web"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"strings"
	"time"
)

func ChatRelayAPI(c *gin.Context) {
	username := utils.GetUserFromContext(c)
	if username == "" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid api key"), "authentication_error")
		return
	}

	if utils.GetAgentFromContext(c) != "api" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid agent"), "authentication_error")
		return
	}

	var form RelayForm
	if err := c.ShouldBindJSON(&form); err != nil {
		abortWithErrorResponse(c, fmt.Errorf("invalid request body: %s", err.Error()), "invalid_request_error")
		return
	}

	db := utils.GetDBFromContext(c)
	user := &auth.User{
		Username: username,
	}
	id := utils.Md5Encrypt(username + form.Model + time.Now().String())
	created := time.Now().Unix()

	messages := transform(form.Messages)
	if strings.HasPrefix(form.Model, "web-") {
		suffix := strings.TrimPrefix(form.Model, "web-")

		form.Model = suffix
		messages = web.UsingWebNativeSegment(true, messages)
	}

	if strings.HasSuffix(form.Model, "-official") {
		form.Model = strings.TrimSuffix(form.Model, "-official")
		form.Official = true
	}

	check := auth.CanEnableModel(db, user, form.Model)
	if !check {
		sendErrorResponse(c, fmt.Errorf("quota exceeded"), "quota_exceeded_error")
		return
	}

	if form.Stream {
		sendStreamTranshipmentResponse(c, form, messages, id, created, user, false)
	} else {
		sendTranshipmentResponse(c, form, messages, id, created, user, false)
	}
}

func getChatProps(form RelayForm, messages []globals.Message, buffer *utils.Buffer, plan bool) *adapter.ChatProps {
	return &adapter.ChatProps{
		Model:             form.Model,
		Message:           messages,
		Plan:              plan,
		Token:             utils.Multi(form.MaxTokens == 0, 2500, form.MaxTokens),
		PresencePenalty:   form.PresencePenalty,
		FrequencyPenalty:  form.FrequencyPenalty,
		RepetitionPenalty: form.RepetitionPenalty,
		Temperature:       form.Temperature,
		TopP:              form.TopP,
		TopK:              form.TopK,
		Tools:             form.Tools,
		ToolChoice:        form.ToolChoice,
		Buffer:            *buffer,
	}
}

func sendTranshipmentResponse(c *gin.Context, form RelayForm, messages []globals.Message, id string, created int64, user *auth.User, plan bool) {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	buffer := utils.NewBuffer(form.Model, messages, channel.ChargeInstance.GetCharge(form.Model))
	err := channel.NewChatRequest(auth.GetGroup(db, user), getChatProps(form, messages, buffer, plan), func(data string) error {
		buffer.Write(data)
		return nil
	})

	admin.AnalysisRequest(form.Model, buffer, err)
	if err != nil {
		auth.RevertSubscriptionUsage(db, cache, user, form.Model)
		globals.Warn(fmt.Sprintf("error from chat request api: %s (instance: %s, client: %s)", err, form.Model, c.ClientIP()))

		sendErrorResponse(c, err)
		return
	}

	CollectQuota(c, user, buffer, plan, err)
	c.JSON(http.StatusOK, RelayResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", id),
		Object:  "chat.completion",
		Created: created,
		Model:   form.Model,
		Choices: []Choice{
			{
				Index:        0,
				Message:      globals.Message{Role: globals.Assistant, Content: buffer.ReadWithDefault(defaultMessage)},
				FinishReason: "stop",
			},
		},
		Usage: Usage{
			PromptTokens:     buffer.CountInputToken(),
			CompletionTokens: buffer.CountOutputToken(),
			TotalTokens:      buffer.CountToken(),
		},
		Quota: utils.Multi[*float32](form.Official, nil, utils.ToPtr(buffer.GetQuota())),
	})
}

func getStreamTranshipmentForm(id string, created int64, form RelayForm, data string, buffer *utils.Buffer, end bool, err error) RelayStreamResponse {
	return RelayStreamResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", id),
		Object:  "chat.completion.chunk",
		Created: created,
		Model:   form.Model,
		Choices: []ChoiceDelta{
			{
				Index: 0,
				Delta: globals.Message{
					Role:    globals.Assistant,
					Content: data,
				},
				FinishReason: utils.Multi[interface{}](end, "stop", nil),
			},
		},
		Usage: Usage{
			PromptTokens:     utils.MultiF(end, func() int { return buffer.CountInputToken() }, 0),
			CompletionTokens: utils.MultiF(end, func() int { return buffer.CountOutputToken() }, 0),
			TotalTokens:      utils.MultiF(end, func() int { return buffer.CountToken() }, 0),
		},
		Quota: utils.Multi[*float32](form.Official, nil, utils.ToPtr(buffer.GetQuota())),
		Error: err,
	}
}

func sendStreamTranshipmentResponse(c *gin.Context, form RelayForm, messages []globals.Message, id string, created int64, user *auth.User, plan bool) {
	partial := make(chan RelayStreamResponse)
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	go func() {
		buffer := utils.NewBuffer(form.Model, messages, channel.ChargeInstance.GetCharge(form.Model))
		err := channel.NewChatRequest(auth.GetGroup(db, user), getChatProps(form, messages, buffer, plan), func(data string) error {
			partial <- getStreamTranshipmentForm(id, created, form, buffer.Write(data), buffer, false, nil)
			return nil
		})

		admin.AnalysisRequest(form.Model, buffer, err)
		if err != nil {
			auth.RevertSubscriptionUsage(db, cache, user, form.Model)
			globals.Warn(fmt.Sprintf("error from chat request api: %s (instance: %s, client: %s)", err.Error(), form.Model, c.ClientIP()))
			partial <- getStreamTranshipmentForm(id, created, form, err.Error(), buffer, true, err)
			close(partial)
			return
		}

		partial <- getStreamTranshipmentForm(id, created, form, "", buffer, true, nil)
		CollectQuota(c, user, buffer, plan, err)
		close(partial)
		return
	}()

	c.Stream(func(w io.Writer) bool {
		if resp, ok := <-partial; ok {
			if resp.Error != nil {
				sendErrorResponse(c, resp.Error)
				return false
			}

			c.Render(-1, utils.NewEvent(resp))
			return true
		}

		c.Render(-1, utils.NewEndEvent())
		return false
	})
}
