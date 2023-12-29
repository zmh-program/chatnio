package dashscope

// ChatRequest is the request body for dashscope
type ChatRequest struct {
	Model      string    `json:"model"`
	Input      ChatInput `json:"input"`
	Parameters ChatParam `json:"parameters"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatInput struct {
	Messages []Message `json:"messages"`
}

type ChatParam struct {
	IncrementalOutput bool     `json:"incremental_output"`
	EnableSearch      *bool    `json:"enable_search,omitempty"`
	MaxTokens         int      `json:"max_tokens"`
	Temperature       *float32 `json:"temperature,omitempty"`
	TopP              *float32 `json:"top_p,omitempty"`
	TopK              *int     `json:"top_k,omitempty"`
	RepetitionPenalty *float32 `json:"repetition_penalty,omitempty"`
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
	Message string `json:"message"`
}
