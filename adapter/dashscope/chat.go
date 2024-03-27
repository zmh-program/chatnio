package dashscope

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

const defaultMaxTokens = 1500

func (c *ChatInstance) GetHeader() map[string]string {
	return map[string]string{
		"Content-Type":    "application/json",
		"Authorization":   fmt.Sprintf("Bearer %s", c.GetApiKey()),
		"X-DashScope-SSE": "enable",
	}
}

func (c *ChatInstance) FormatMessages(message []globals.Message) []Message {
	var messages []Message
	var start bool
	for _, v := range message {
		if v.Role == globals.Tool {
			continue
		}

		if !start {
			start = true

			// dashscope first message should be [`user`, `system`] role, convert other roles to `user`
			if v.Role != globals.User && v.Role != globals.System {
				v.Role = globals.User
			}
		}

		messages = append(messages, Message{
			Role:    v.Role,
			Content: v.Content,
		})
	}

	return messages
}

func (c *ChatInstance) GetMaxTokens(props *adaptercommon.ChatProps) int {
	// dashscope has a restriction of 1500 tokens in completion
	if props.MaxTokens == nil || *props.MaxTokens <= 0 || *props.MaxTokens > 1500 {
		return defaultMaxTokens
	}

	return *props.MaxTokens
}

func (c *ChatInstance) GetTopP(props *adaptercommon.ChatProps) *float32 {
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

func (c *ChatInstance) GetRepeatPenalty(props *adaptercommon.ChatProps) *float32 {
	// range of repetition_penalty should greater than 0.0
	if props.RepetitionPenalty == nil {
		return nil
	}

	if *props.RepetitionPenalty <= 0.0 {
		return utils.ToPtr[float32](0.1)
	}

	return props.RepetitionPenalty
}

func (c *ChatInstance) GetChatBody(props *adaptercommon.ChatProps) ChatRequest {
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

func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
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
		props.Proxy,
	)
}
