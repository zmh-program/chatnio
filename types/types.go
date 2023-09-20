package types

type ChatGPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatGPTRequest struct {
	Model    string           `json:"model"`
	Messages []ChatGPTMessage `json:"messages"`
	MaxToken int              `json:"max_tokens"`
	Stream   bool             `json:"stream"`
}

type ChatGPTRequestWithInfinity struct {
	Model    string           `json:"model"`
	Messages []ChatGPTMessage `json:"messages"`
	Stream   bool             `json:"stream"`
}

type ChatGPTImageRequest struct {
	Prompt string `json:"prompt"`
	Size   string `json:"size"`
	N      int    `json:"n"`
}

type ChatGPTStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Data    struct {
		Choices []struct {
			Delta struct {
				Content string `json:"content"`
			}
			Index int `json:"index"`
		} `json:"choices"`
	} `json:"data"`
}

type ChatGPTSegmentResponse struct {
	Quota   float32 `json:"quota"`
	Keyword string  `json:"keyword"`
	Message string  `json:"message"`
	End     bool    `json:"end"`
}
