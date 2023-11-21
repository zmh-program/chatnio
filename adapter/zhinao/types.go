package zhinao

import "chat/globals"

// 360 ZhiNao API is similar to OpenAI API

// ChatRequest is the request body for zhinao
type ChatRequest struct {
	Model             string            `json:"model"`
	Messages          []globals.Message `json:"messages"`
	MaxToken          *int              `json:"max_tokens,omitempty"`
	TopP              *float32          `json:"top_p,omitempty"`
	TopK              *int              `json:"top_k,omitempty"`
	Temperature       *float32          `json:"temperature,omitempty"`
	RepetitionPenalty *float32          `json:"repetition_penalty,omitempty"`
	Stream            bool              `json:"stream"`
}

// ChatResponse is the native http request body for zhinao
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

// ChatStreamResponse is the stream response body for zhinao
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

type ChatStreamErrorResponse struct {
	Data struct {
		Error struct {
			Message string `json:"message"`
			Type    string `json:"type"`
		} `json:"error"`
	} `json:"data"`
}
