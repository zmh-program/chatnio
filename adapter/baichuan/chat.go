package baichuan

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model       string
	Message     []globals.Message
	TopP        *float32
	TopK        *int
	Temperature *float32
}

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

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) ChatRequest {
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
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, false),
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
func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	buf := ""
	cursor := 0
	chunk := ""

	err := utils.EventSource(
		"POST",
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, true),
		func(data string) error {
			data, err := c.ProcessLine(buf, data)
			chunk += data

			if err != nil {
				if strings.HasPrefix(err.Error(), "baichuan error") {
					return err
				}

				// error when break line
				buf = buf + data
				return nil
			}

			buf = ""
			if data != "" {
				cursor += 1
				if err := callback(data); err != nil {
					return err
				}
			}
			return nil
		},
	)

	if err != nil {
		return err
	} else if len(chunk) == 0 {
		return fmt.Errorf("empty response")
	}

	return nil
}
