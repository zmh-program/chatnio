package claude

// ChatBody is the request body for anthropic claude

type Message struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"`
}

type MessageImage struct {
	Type      string      `json:"type"`
	MediaType interface{} `json:"media_type"`
	Data      interface{} `json:"data"`
}

type MessageContent struct {
	Type   string        `json:"type"`
	Text   *string       `json:"text,omitempty"`
	Source *MessageImage `json:"source,omitempty"`
}

type ChatBody struct {
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens"`
	Model       string    `json:"model"`
	System      string    `json:"system"`
	Stream      bool      `json:"stream"`
	Temperature *float32  `json:"temperature,omitempty"`
	TopP        *float32  `json:"top_p,omitempty"`
	TopK        *int      `json:"top_k,omitempty"`
}

type ChatStreamResponse struct {
	Type  string `json:"type"`
	Index int    `json:"index"`
	Delta struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"delta"`
}

type ChatErrorResponse struct {
	Error struct {
		Type    string `json:"type" binding:"required"`
		Message string `json:"message"`
	} `json:"error"`
}
