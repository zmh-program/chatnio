package dashscope

import "chat/globals"

// ChatRequest is the request body for dashscope
type ChatRequest struct {
	Model      string    `json:"model"`
	Input      ChatInput `json:"input"`
	Parameters ChatParam `json:"parameters"`
}

type ChatInput struct {
	Prompt   string            `json:"prompt"`
	Messages []globals.Message `json:"messages"`
}

type ChatParam struct {
	EnableSearch      bool `json:"enable_search"`
	IncrementalOutput bool `json:"incremental_output"`
}

// ChatResponse is the response body for dashscope
type ChatResponse struct {
	Output struct {
		FinishReason string `json:"finish_reason"`
		Text         string `json:"text"`
	} `json:"output"`
	RequestId string `json:"request_id"`
	Usage     struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}
