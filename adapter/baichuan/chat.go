package baichuan

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
)

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetModel(model string) string {
	switch model {
	case globals.Baichuan53B:
		return "Baichuan2"
	default:
		return model
	}
}

func (c *ChatInstance) GetMessages(messages []globals.Message) []globals.Message {
	for _, message := range messages {
		if message.Role == globals.System || message.Role == globals.Tool {
			message.Role = globals.User
		}
	}

	return messages
}

func (c *ChatInstance) GetChatBody(props *adaptercommon.ChatProps, stream bool) ChatRequest {
	return ChatRequest{
		Model:       c.GetModel(props.Model),
		Messages:    c.GetMessages(props.Message),
		Stream:      stream,
		TopP:        props.TopP,
		TopK:        props.TopK,
		Temperature: props.Temperature,
	}
}

// CreateChatRequest is the native http request body for baichuan
func (c *ChatInstance) CreateChatRequest(props *adaptercommon.ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, false),
		props.Proxy,
	)

	if err != nil || res == nil {
		return "", fmt.Errorf("baichuan error: %s", err.Error())
	}

	data := utils.MapToStruct[ChatResponse](res)
	if data == nil {
		return "", fmt.Errorf("baichuan error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("baichuan error: %s", data.Error.Message)
	}
	return data.Choices[0].Message.Content, nil
}

// CreateStreamChatRequest is the stream response body for baichuan
func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
	err := utils.EventScanner(&utils.EventScannerProps{
		Method:  "POST",
		Uri:     c.GetChatEndpoint(),
		Headers: c.GetHeader(),
		Body:    c.GetChatBody(props, true),
		Callback: func(data string) error {
			partial, err := c.ProcessLine(data)
			if err != nil {
				return err
			}
			return callback(partial)
		},
	}, props.Proxy)

	if err != nil {
		if form := processChatErrorResponse(err.Body); form != nil {
			msg := fmt.Sprintf("%s (type: %s)", form.Error.Message, form.Error.Type)
			return errors.New(msg)
		}
		return err.Error
	}

	return nil
}
