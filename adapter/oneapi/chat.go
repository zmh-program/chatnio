package oneapi

import "C"
import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
	Token   int
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) interface{} {
	if props.Token != -1 {
		return ChatRequest{
			Model:    props.Model,
			Messages: formatMessages(props),
			MaxToken: props.Token,
			Stream:   stream,
		}
	}

	return ChatRequestWithInfinity{
		Model:    props.Model,
		Messages: formatMessages(props),
		Stream:   stream,
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
			data, err := c.ProcessLine(buf, data)

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
