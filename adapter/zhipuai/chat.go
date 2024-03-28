package zhipuai

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
	"regexp"
)

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/api/paas/v4/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetCompletionPrompt(messages []globals.Message) string {
	result := ""
	for _, message := range messages {
		result += fmt.Sprintf("%s: %s\n", message.Role, message.Content)
	}
	return result
}

func (c *ChatInstance) GetLatestPrompt(props *adaptercommon.ChatProps) string {
	if len(props.Message) == 0 {
		return ""
	}

	return props.Message[len(props.Message)-1].Content
}

func (c *ChatInstance) ConvertModel(model string) string {
	// for v3 legacy adapter
	switch model {
	case globals.ZhiPuChatGLMTurbo:
		return GLMTurbo
	case globals.ZhiPuChatGLMPro:
		return GLMPro
	case globals.ZhiPuChatGLMStd:
		return GLMStd
	case globals.ZhiPuChatGLMLite:
		return GLMLite
	default:
		return GLMStd
	}
}

func (c *ChatInstance) GetChatBody(props *adaptercommon.ChatProps, stream bool) interface{} {
	if props.Model == globals.GPT3TurboInstruct {
		// for completions
		return CompletionRequest{
			Model:    c.ConvertModel(props.Model),
			Prompt:   c.GetCompletionPrompt(props.Message),
			MaxToken: props.MaxTokens,
			Stream:   stream,
		}
	}

	messages := formatMessages(props)

	// chatglm top_p should be (0.0, 1.0) and cannot be 0 or 1
	if props.TopP != nil && *props.TopP >= 1.0 {
		props.TopP = utils.ToPtr[float32](0.99)
	} else if props.TopP != nil && *props.TopP <= 0.0 {
		props.TopP = utils.ToPtr[float32](0.01)
	}

	return ChatRequest{
		Model:            props.Model,
		Messages:         messages,
		MaxToken:         props.MaxTokens,
		Stream:           stream,
		PresencePenalty:  props.PresencePenalty,
		FrequencyPenalty: props.FrequencyPenalty,
		Temperature:      props.Temperature,
		TopP:             props.TopP,
		Tools:            props.Tools,
		ToolChoice:       props.ToolChoice,
	}
}

// CreateChatRequest is the native http request body for chatglm
func (c *ChatInstance) CreateChatRequest(props *adaptercommon.ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, false),
		props.Proxy,
	)

	if err != nil || res == nil {
		return "", fmt.Errorf("chatglm error: %s", err.Error())
	}

	data := utils.MapToStruct[ChatResponse](res)
	if data == nil {
		return "", fmt.Errorf("chatglm error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("chatglm error: %s", data.Error.Message)
	}
	return data.Choices[0].Message.Content, nil
}

func hideRequestId(message string) string {
	// xxx (request id: 2024020311120561344953f0xfh0TX)

	exp := regexp.MustCompile(`\(request id: [a-zA-Z0-9]+\)`)
	return exp.ReplaceAllString(message, "")
}

// CreateStreamChatRequest is the stream response body for chatglm
func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
	ticks := 0
	err := utils.EventScanner(&utils.EventScannerProps{
		Method:  "POST",
		Uri:     c.GetChatEndpoint(),
		Headers: c.GetHeader(),
		Body:    c.GetChatBody(props, true),
		Callback: func(data string) error {
			ticks += 1

			partial, err := c.ProcessLine(data, false)
			if err != nil {
				return err
			}
			return callback(partial)
		},
	}, props.Proxy)

	if err != nil {
		if form := processChatErrorResponse(err.Body); form != nil {
			if form.Error.Type == "" && form.Error.Message == "" {
				return errors.New(utils.ToMarkdownCode("json", err.Body))
			}

			msg := fmt.Sprintf("%s (code: %s)", form.Error.Message, form.Error.Code)
			return errors.New(hideRequestId(msg))
		}
		return err.Error
	}

	if ticks == 0 {
		return errors.New("no response")
	}

	return nil
}
