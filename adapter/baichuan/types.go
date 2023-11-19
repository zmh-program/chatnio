package baichuan

import "chat/globals"

// Baichuan AI API is similar to OpenAI API

// ChatRequest is the request body for baichuan
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

// ChatResponse is the native http request body for baichuan
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

// ChatStreamResponse is the stream response body for baichuan
type ChatStreamResponse struct {
	Data struct {
		ID      string `json:"id"`
		Object  string `json:"object"`
		Created int64  `json:"created"`
		Model   string `json:"model"`
		Choices []struct {
			Delta struct {
				Content string `json:"content"`
			}
			Index int `json:"index"`
		} `json:"choices"`
	} `json:"data"`

	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		}
		Index int `json:"index"`
	} `json:"choices"`
}

type ChatStreamErrorResponse struct {
	Data struct {
		Error struct {
			Message string `json:"message"`
			Type    string `json:"type"`
		} `json:"error"`
	} `json:"data"`
}
