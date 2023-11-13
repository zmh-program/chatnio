package chatgpt

import "chat/globals"

// ChatRequest is the request body for chatgpt
type ChatRequest struct {
	Model    string            `json:"model"`
	Messages []globals.Message `json:"messages"`
	MaxToken int               `json:"max_tokens"`
	Stream   bool              `json:"stream"`
}

type ChatRequestWithInfinity struct {
	Model    string            `json:"model"`
	Messages []globals.Message `json:"messages"`
	Stream   bool              `json:"stream"`
}

// CompletionRequest ChatRequest is the request body for chatgpt completion
type CompletionRequest struct {
	Model    string `json:"model"`
	Prompt   string `json:"prompt"`
	MaxToken int    `json:"max_tokens"`
	Stream   bool   `json:"stream"`
}

type CompletionWithInfinity struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

// ChatResponse is the native http request body for chatgpt
type ChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		}
	} `json:"choices"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

// ChatStreamResponse is the stream response body for chatgpt
type ChatStreamResponse struct {
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

// CompletionResponse is the native http request body / stream response body for chatgpt completion
type CompletionResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Data    struct {
		Choices []struct {
			Text  string `json:"text"`
			Index int    `json:"index"`
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

type ImageSize string

// ImageRequest is the request body for chatgpt dalle image generation
type ImageRequest struct {
	Model  string    `json:"model"`
	Prompt string    `json:"prompt"`
	Size   ImageSize `json:"size"`
	N      int       `json:"n"`
}

type ImageResponse struct {
	Data []struct {
		Url string `json:"url"`
	} `json:"data"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

var (
	ImageSize256  ImageSize = "256x256"
	ImageSize512  ImageSize = "512x512"
	ImageSize1024 ImageSize = "1024x1024"
)
