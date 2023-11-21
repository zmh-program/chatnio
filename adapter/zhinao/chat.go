package zhinao

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model             string
	Message           []globals.Message
	Token             *int
	TopP              *float32
	TopK              *int
	Temperature       *float32
	RepetitionPenalty *float32
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetModel(model string) string {
	switch model {
	case globals.GPT360V9:
		return "360GPT_S2_V9"
	default:
		return model
	}
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) interface{} {
	// 2048 is the max token for 360GPT
	if props.Token != nil && *props.Token > 2048 {
		props.Token = utils.ToPtr(2048)
	}

	return ChatRequest{
		Model: c.GetModel(props.Model),
		Messages: utils.EachNotNil(props.Message, func(message globals.Message) *globals.Message {
			if message.Role == globals.Tool {
				return nil
			}

			return &message
		}),
		MaxToken:          props.Token,
		Stream:            stream,
		Temperature:       props.Temperature,
		TopP:              props.TopP,
		TopK:              props.TopK,
		RepetitionPenalty: props.RepetitionPenalty,
	}
}

// CreateChatRequest is the native http request body for zhinao
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, false),
	)

	if err != nil || res == nil {
		return "", fmt.Errorf("zhinao error: %s", err.Error())
	}

	data := utils.MapToStruct[ChatResponse](res)
	if data == nil {
		return "", fmt.Errorf("zhinao error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("zhinao error: %s", data.Error.Message)
	}
	return data.Choices[0].Message.Content, nil
}

// CreateStreamChatRequest is the stream response body for zhinao
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
				if strings.HasPrefix(err.Error(), "zhinao error") {
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
