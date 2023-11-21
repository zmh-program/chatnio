package oneapi

import "chat/globals"

// ChatRequest is the request body for oneapi
type ChatRequest struct {
	Model            string                 `json:"model"`
	Messages         []globals.Message      `json:"messages"`
	MaxToken         *int                   `json:"max_tokens,omitempty"`
	Stream           bool                   `json:"stream"`
	PresencePenalty  *float32               `json:"presence_penalty,omitempty"`
	FrequencyPenalty *float32               `json:"frequency_penalty,omitempty"`
	Temperature      *float32               `json:"temperature,omitempty"`
	TopP             *float32               `json:"top_p,omitempty"`
	Tools            *globals.FunctionTools `json:"tools,omitempty"`
	ToolChoice       *interface{}           `json:"tool_choice,omitempty"` // string or object
}

// ChatResponse is the native http request body for oneapi
type ChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int             `json:"index"`
		Message      globals.Message `json:"message"`
		FinishReason string          `json:"finish_reason"`
	} `json:"choices"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

// ChatStreamResponse is the stream response body for oneapi
type ChatStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Data    struct {
		Choices []struct {
			Delta        globals.Message `json:"delta"`
			Index        int             `json:"index"`
			FinishReason string          `json:"finish_reason"`
		} `json:"choices"`
	} `json:"data"`
}

type ChatStreamErrorResponse struct {
	Data struct {
		Error struct {
			Message string `json:"message"`
			Type    string `json:"type"`
		} `json:"error"`
	} `json:"data"`
}
