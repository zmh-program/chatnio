package manager

import (
	"chat/globals"
	"chat/utils"
	"fmt"
)

type Message struct {
	Role         string                `json:"role,omitempty"`
	Content      interface{}           `json:"content"`
	Name         *string               `json:"name,omitempty"`
	FunctionCall *globals.FunctionCall `json:"function_call,omitempty"` // only `function` role
	ToolCallId   *string               `json:"tool_call_id,omitempty"`  // only `tool` role
	ToolCalls    *globals.ToolCalls    `json:"tool_calls,omitempty"`    // only `assistant` role
}

type ImageUrl struct {
	Url    string  `json:"url"`
	Detail *string `json:"detail,omitempty"`
}

type MessageContent struct {
	Type     string    `json:"type"`
	Text     *string   `json:"text,omitempty"`
	ImageUrl *ImageUrl `json:"image_url,omitempty"`
}

type MessageContents []MessageContent

type RelayForm struct {
	Model             string    `json:"model" binding:"required"`
	Messages          []Message `json:"messages" binding:"required"`
	Stream            bool      `json:"stream"`
	MaxTokens         *int      `json:"max_tokens"`
	PresencePenalty   *float32  `json:"presence_penalty"`
	FrequencyPenalty  *float32  `json:"frequency_penalty"`
	RepetitionPenalty *float32  `json:"repetition_penalty"`
	Temperature       *float32  `json:"temperature"`
	TopP              *float32  `json:"top_p"`
	TopK              *int      `json:"top_k"`
	Tools             *globals.FunctionTools
	ToolChoice        *interface{}
	Official          bool `json:"official"`
}

type Choice struct {
	Index        int             `json:"index"`
	Message      globals.Message `json:"message"`
	FinishReason string          `json:"finish_reason"`
}

type StreamMessage struct {
	Role         *string               `json:"role"`
	Content      string                `json:"content"`
	Name         *string               `json:"name,omitempty"`
	FunctionCall *globals.FunctionCall `json:"function_call,omitempty"` // only `function` role
	ToolCallId   *string               `json:"tool_call_id,omitempty"`  // only `tool` role
	ToolCalls    *globals.ToolCalls    `json:"tool_calls,omitempty"`    // only `assistant` role
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type RelayResponse struct {
	Id      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
	Quota   *float32 `json:"quota,omitempty"`
}

type ChoiceDelta struct {
	Index        int         `json:"index"`
	Delta        Message     `json:"delta"`
	FinishReason interface{} `json:"finish_reason"`
}

type RelayStreamResponse struct {
	Id      string        `json:"id"`
	Object  string        `json:"object"`
	Created int64         `json:"created"`
	Model   string        `json:"model"`
	Choices []ChoiceDelta `json:"choices"`
	Usage   Usage         `json:"usage"`
	Quota   *float32      `json:"quota,omitempty"`
	Error   error         `json:"error,omitempty"`
}

type RelayErrorResponse struct {
	Error TranshipmentError `json:"error"`
}

type TranshipmentError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

type RelayImageForm struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      *int   `json:"n,omitempty"`
}

type RelayImageData struct {
	Url string `json:"url"`
}

type RelayImageResponse struct {
	Created int64            `json:"created"`
	Data    []RelayImageData `json:"data"`
}

func transformContent(content interface{}) string {
	switch v := content.(type) {
	case string:
		return v
	default:
		var result string
		data := utils.MapToStruct[MessageContents](v)
		if data == nil || len(*data) == 0 {
			return ""
		}

		for _, v := range *data {
			if v.Text != nil {
				result += *v.Text
			}

			if v.ImageUrl != nil {
				result += fmt.Sprintf(" %s ", v.ImageUrl.Url)
			}
		}
		return result
	}
}

func transform(m []Message) []globals.Message {
	var messages []globals.Message
	for _, v := range m {
		messages = append(messages, globals.Message{
			Role:         v.Role,
			Content:      transformContent(v.Content),
			Name:         v.Name,
			FunctionCall: v.FunctionCall,
			ToolCallId:   v.ToolCallId,
			ToolCalls:    v.ToolCalls,
		})
	}
	return messages
}
