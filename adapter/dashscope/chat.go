package dashscope

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model             string
	Token             int
	Temperature       *float32
	TopP              *float32
	TopK              *int
	RepetitionPenalty *float32
	Message           []globals.Message
}

func (c *ChatInstance) GetHeader() map[string]string {
	return map[string]string{
		"Content-Type":    "application/json",
		"Authorization":   fmt.Sprintf("Bearer %s", c.GetApiKey()),
		"X-DashScope-SSE": "enable",
	}
}

func (c *ChatInstance) FormatMessages(message []globals.Message) []Message {
	var messages []Message
	for _, v := range message {
		if v.Role == globals.Tool {
			continue
		}

		messages = append(messages, Message{
			Role:    v.Role,
			Content: v.Content,
		})
	}

	return messages
}

func (c *ChatInstance) GetChatBody(props *ChatProps) ChatRequest {
	if props.Token <= 0 || props.Token > 1500 {
		props.Token = 1500
	}

	return ChatRequest{
		Model: strings.TrimSuffix(props.Model, "-net"),
		Input: ChatInput{
			Messages: c.FormatMessages(props.Message),
		},
		Parameters: ChatParam{
			MaxTokens:         props.Token,
			Temperature:       props.Temperature,
			TopP:              props.TopP,
			TopK:              props.TopK,
			RepetitionPenalty: props.RepetitionPenalty,
			EnableSearch:      utils.ToPtr(strings.HasSuffix(props.Model, "-net")),
			IncrementalOutput: true,
		},
	}
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/api/v1/services/aigc/text-generation/generation", c.Endpoint)
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	return utils.EventSource(
		"POST",
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props),
		func(data string) error {
			data = strings.TrimSpace(data)
			if !strings.HasPrefix(data, "data:") {
				return nil
			}

			slice := strings.TrimSpace(strings.TrimPrefix(data, "data:"))
			if form := utils.UnmarshalForm[ChatResponse](slice); form != nil {
				if form.Output.Text == "" && form.Message != "" {
					return fmt.Errorf("dashscope error: %s", form.Message)
				}

				if err := callback(form.Output.Text); err != nil {
					return err
				}
				return nil
			}

			globals.Debug(fmt.Sprintf("dashscope error: cannot unmarshal data %s", slice))

			return nil
		},
	)
}
