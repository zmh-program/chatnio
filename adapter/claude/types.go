package claude

// ChatBody is the request body for anthropic claude
type ChatBody struct {
	Prompt            string `json:"prompt"`
	MaxTokensToSample int    `json:"max_tokens_to_sample"`
	Model             string `json:"model"`
	Stream            bool   `json:"stream"`
}

// ChatResponse is the native http request and stream response for anthropic claude
type ChatResponse struct {
	Completion string `json:"completion"`
	LogId      string `json:"log_id"`
}
