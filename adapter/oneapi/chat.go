package oneapi

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model            string
	Message          []globals.Message
	Token            *int
	PresencePenalty  *float32               `json:"presence_penalty"`
	FrequencyPenalty *float32               `json:"frequency_penalty"`
	Temperature      *float32               `json:"temperature"`
	TopP             *float32               `json:"top_p"`
	Tools            *globals.FunctionTools `json:"tools"`
	ToolChoice       *interface{}           `json:"tool_choice"` // string or object
	Buffer           utils.Buffer
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) ChatRequest {
	return ChatRequest{
		Model:            props.Model,
		Messages:         formatMessages(props),
		MaxToken:         props.Token,
		Stream:           stream,
		PresencePenalty:  props.PresencePenalty,
		FrequencyPenalty: props.FrequencyPenalty,
		Temperature:      props.Temperature,
		TopP:             props.TopP,
		Tools:            props.Tools,
		ToolChoice:       props.ToolChoice,
	}
}

// CreateChatRequest is the native http request body for oneapi
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, false),
	)

	if err != nil || res == nil {
		return "", fmt.Errorf("oneapi error: %s", err.Error())
	}

	data := utils.MapToStruct[ChatResponse](res)
	if data == nil {
		return "", fmt.Errorf("oneapi error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("oneapi error: %s", data.Error.Message)
	}
	return data.Choices[0].Message.Content, nil
}

// CreateStreamChatRequest is the stream response body for oneapi
func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	buf := ""

	return utils.EventSource(
		"POST",
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, true),
		func(data string) error {
			data, err := c.ProcessLine(props.Buffer, buf, data)

			if err != nil {
				if strings.HasPrefix(err.Error(), "oneapi error") {
					return err
				}

				// error when break line
				buf = buf + data
				return nil
			}

			buf = ""
			if data != "" {
				if err := callback(data); err != nil {
					return err
				}
			}
			return nil
		},
	)
}
