package claude

import "chat/globals"

// ChatBody is the request body for anthropic claude
type ChatBody struct {
	Messages    []globals.Message `json:"messages"`
	MaxTokens   int               `json:"max_tokens"`
	Model       string            `json:"model"`
	Stream      bool              `json:"stream"`
	Temperature *float32          `json:"temperature,omitempty"`
	TopP        *float32          `json:"top_p,omitempty"`
	TopK        *int              `json:"top_k,omitempty"`
}

// ChatResponse is the native http request and stream response for anthropic claude
type ChatResponse struct {
	Completion string `json:"completion"`
	LogId      string `json:"log_id"`
}
