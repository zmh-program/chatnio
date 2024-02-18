package dashscope

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

const defaultMaxTokens = 1500

type ChatProps struct {
	Model             string
	Token             *int
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

func (c *ChatInstance) GetMaxTokens(props *ChatProps) int {
	// dashscope has a restriction of 1500 tokens in completion
	if props.Token == nil || *props.Token <= 0 || *props.Token > 1500 {
		return defaultMaxTokens
	}

	return *props.Token
}

func (c *ChatInstance) GetTopP(props *ChatProps) *float32 {
	// range of top_p should be (0.0, 1.0)
	if props.TopP == nil {
		return nil
	}

	if *props.TopP <= 0.0 {
		return utils.ToPtr[float32](0.1)
	} else if *props.TopP >= 1.0 {
		return utils.ToPtr[float32](0.9)
	}

	return props.TopP
}

func (c *ChatInstance) GetRepeatPenalty(props *ChatProps) *float32 {
	// range of repetition_penalty should greater than 0.0
	if props.RepetitionPenalty == nil {
		return nil
	}

	if *props.RepetitionPenalty <= 0.0 {
		return utils.ToPtr[float32](0.1)
	}

	return props.RepetitionPenalty
}

func (c *ChatInstance) GetChatBody(props *ChatProps) ChatRequest {
	return ChatRequest{
		Model: strings.TrimSuffix(props.Model, "-net"),
		Input: ChatInput{
			Messages: c.FormatMessages(props.Message),
		},
		Parameters: ChatParam{
			MaxTokens:         c.GetMaxTokens(props),
			Temperature:       props.Temperature,
			TopP:              c.GetTopP(props),
			TopK:              props.TopK,
			RepetitionPenalty: c.GetRepeatPenalty(props),
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
			// example:
			// id:1
			// event:result
			// :HTTP_STATUS/200
			// data:{"output":{"finish_reason":"null","text":"hi"},"usage":{"total_tokens":15,"input_tokens":14,"output_tokens":1},"request_id":"08da1369-e009-9f8f-8363-54b966f80daf"}

			data = strings.TrimSpace(data)
			if !strings.HasPrefix(data, "data:") {
				return nil
			}

			slice := strings.TrimSpace(strings.TrimPrefix(data, "data:"))
			if form := utils.UnmarshalForm[ChatResponse](slice); form != nil {
				if form.Output.Text == "" && form.Message != "" {
					return fmt.Errorf("dashscope error: %s", form.Message)
				}

				if err := callback(&globals.Chunk{Content: form.Output.Text}); err != nil {
					return err
				}
				return nil
			}

			globals.Debug(fmt.Sprintf("dashscope error: cannot unmarshal data %s", slice))

			return nil
		},
	)
}
