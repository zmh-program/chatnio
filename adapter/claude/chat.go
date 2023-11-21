package claude

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model       string
	Message     []globals.Message
	Token       int
	Temperature *float32
	TopP        *float32
	TopK        *int
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/complete", c.GetEndpoint())
}

func (c *ChatInstance) GetChatHeaders() map[string]string {
	return map[string]string{
		"content-type": "application/json",
		"accept":       "application/json",
		"x-api-key":    c.GetApiKey(),
	}
}

func (c *ChatInstance) ConvertMessage(message []globals.Message) string {
	mapper := map[string]string{
		globals.System:    "Assistant",
		globals.User:      "Human",
		globals.Assistant: "Assistant",
	}

	var result string
	for i, item := range message {
		if item.Role == globals.Tool {
			continue
		}
		if i == 0 && item.Role == globals.Assistant {
			// skip first assistant message
			continue
		}

		result += fmt.Sprintf("\n\n%s: %s", mapper[item.Role], item.Content)
	}
	return fmt.Sprintf("%s\n\nAssistant:", result)
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) *ChatBody {
	return &ChatBody{
		Prompt:            c.ConvertMessage(props.Message),
		MaxTokensToSample: props.Token,
		Model:             props.Model,
		Stream:            stream,
		Temperature:       props.Temperature,
		TopP:              props.TopP,
		TopK:              props.TopK,
	}
}

// CreateChatRequest is the request for anthropic claude
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	data, err := utils.Post(c.GetChatEndpoint(), c.GetChatHeaders(), c.GetChatBody(props, false))
	if err != nil {
		return "", fmt.Errorf("claude error: %s", err.Error())
	}

	if form := utils.MapToStruct[ChatResponse](data); form != nil {
		return form.Completion, nil
	}
	return "", fmt.Errorf("claude error: invalid response")
}

func (c *ChatInstance) ProcessLine(buf, data string) (string, error) {
	// response example:
	//
	// event:completion
	// data:{"completion":"!","stop_reason":null,"model":"claude-2.0","stop":null,"log_id":"f5f659a5807419c94cfac4a9f2f79a66e95733975714ce7f00e30689dd136b02"}

	if !strings.HasPrefix(data, "data:") && strings.HasPrefix(data, "event:") {
		return "", nil
	} else {
		data = strings.TrimSpace(strings.TrimPrefix(data, "data:"))
	}

	if len(data) == 0 {
		return "", nil
	}

	if form := utils.UnmarshalForm[ChatResponse](data); form != nil {
		return form.Completion, nil
	}

	data = buf + data
	if form := utils.UnmarshalForm[ChatResponse](data); form != nil {
		return form.Completion, nil
	}

	globals.Warn(fmt.Sprintf("anthropic error: cannot parse response: %s", data))
	return "", fmt.Errorf("claude error: invalid response")
}

// CreateStreamChatRequest is the stream request for anthropic claude
func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error {
	buf := ""

	return utils.EventSource(
		"POST",
		c.GetChatEndpoint(),
		c.GetChatHeaders(),
		c.GetChatBody(props, true),
		func(data string) error {

			if resp, err := c.ProcessLine(buf, data); err == nil && len(resp) > 0 {
				buf = ""
				if err := hook(resp); err != nil {
					return err
				}
			} else {
				buf = buf + data
			}

			return nil
		})
}
