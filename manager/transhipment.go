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

type TranshipmentForm struct {
	Model             string            `json:"model" binding:"required"`
	Messages          []globals.Message `json:"messages" binding:"required"`
	Stream            bool              `json:"stream"`
	MaxTokens         int               `json:"max_tokens"`
	PresencePenalty   *float32          `json:"presence_penalty"`
	FrequencyPenalty  *float32          `json:"frequency_penalty"`
	RepetitionPenalty *float32          `json:"repetition_penalty"`
	Temperature       *float32          `json:"temperature"`
	TopP              *float32          `json:"top_p"`
	TopK              *int              `json:"top_k"`
	Tools             *globals.FunctionTools
	ToolChoice        *interface{}
	Official          bool `json:"official"`
}

type Choice struct {
	Index        int             `json:"index"`
	Message      globals.Message `json:"message"`
	FinishReason string          `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type TranshipmentResponse struct {
	Id      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
	Quota   *float32 `json:"quota,omitempty"`
}

type ChoiceDelta struct {
	Index        int             `json:"index"`
	Delta        globals.Message `json:"delta"`
	FinishReason interface{}     `json:"finish_reason"`
}

type TranshipmentStreamResponse struct {
	Id      string        `json:"id"`
	Object  string        `json:"object"`
	Created int64         `json:"created"`
	Model   string        `json:"model"`
	Choices []ChoiceDelta `json:"choices"`
	Usage   Usage         `json:"usage"`
	Quota   *float32      `json:"quota,omitempty"`
	Error   error         `json:"error,omitempty"`
}

type TranshipmentErrorResponse struct {
	Error TranshipmentError `json:"error"`
}

type TranshipmentError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

func ModelAPI(c *gin.Context) {
	c.JSON(http.StatusOK, channel.ManagerInstance.GetModels())
}

func sendErrorResponse(c *gin.Context, err error, types ...string) {
	var errType string
	if len(types) > 0 {
		errType = types[0]
	} else {
		errType = "chatnio_api_error"
	}

	c.JSON(http.StatusServiceUnavailable, TranshipmentErrorResponse{
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

func TranshipmentAPI(c *gin.Context) {
	username := utils.GetUserFromContext(c)
	if username == "" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid api key"), "authentication_error")
		return
	}

	if utils.GetAgentFromContext(c) != "api" {
		abortWithErrorResponse(c, fmt.Errorf("access denied for invalid agent"), "authentication_error")
		return
	}

	var form TranshipmentForm
	if err := c.ShouldBindJSON(&form); err != nil {
		abortWithErrorResponse(c, fmt.Errorf("invalid request body: %s", err.Error()), "invalid_request_error")
		return
	}

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)
	user := &auth.User{
		Username: username,
	}
	id := utils.Md5Encrypt(username + form.Model + time.Now().String())
	created := time.Now().Unix()

	if strings.HasPrefix(form.Model, "web-") {
		suffix := strings.TrimPrefix(form.Model, "web-")

		form.Model = suffix
		form.Messages = web.UsingWebNativeSegment(true, form.Messages)
	}

	if strings.HasSuffix(form.Model, "-official") {
		form.Model = strings.TrimSuffix(form.Model, "-official")
		form.Official = true
	}

	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, form.Model)
	if !check {
		sendErrorResponse(c, fmt.Errorf("quota exceeded"), "quota_exceeded_error")
		return
	}

	if form.Stream {
		sendStreamTranshipmentResponse(c, form, id, created, user, plan)
	} else {
		sendTranshipmentResponse(c, form, id, created, user, plan)
	}
}

func GetProps(form TranshipmentForm, buffer *utils.Buffer, plan bool) *adapter.ChatProps {
	return &adapter.ChatProps{
		Model:             form.Model,
		Message:           form.Messages,
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

func sendTranshipmentResponse(c *gin.Context, form TranshipmentForm, id string, created int64, user *auth.User, plan bool) {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	buffer := utils.NewBuffer(form.Model, form.Messages)
	err := channel.NewChatRequest(GetProps(form, buffer, plan), func(data string) error {
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

	CollectQuota(c, user, buffer, plan)
	c.JSON(http.StatusOK, TranshipmentResponse{
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

func getStreamTranshipmentForm(id string, created int64, form TranshipmentForm, data string, buffer *utils.Buffer, end bool, err error) TranshipmentStreamResponse {
	return TranshipmentStreamResponse{
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

func sendStreamTranshipmentResponse(c *gin.Context, form TranshipmentForm, id string, created int64, user *auth.User, plan bool) {
	partial := make(chan TranshipmentStreamResponse)
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	go func() {
		buffer := utils.NewBuffer(form.Model, form.Messages)
		err := channel.NewChatRequest(GetProps(form, buffer, plan), func(data string) error {
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
		CollectQuota(c, user, buffer, plan)
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
