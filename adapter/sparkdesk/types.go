package sparkdesk

import "chat/globals"

// ChatRequest is the request body for sparkdesk
type ChatRequest struct {
	Header    RequestHeader    `json:"header"`
	Payload   RequestPayload   `json:"payload"`
	Parameter RequestParameter `json:"parameter"`
}

type RequestHeader struct {
	AppId string `json:"app_id"`
}

type RequestPayload struct {
	Message   MessagePayload    `json:"message"`
	Functions *FunctionsPayload `json:"functions,omitempty"`
}

type FunctionsPayload struct {
	Text []globals.ToolFunction `json:"text"`
}

type Message struct {
	Role         string        `json:"role"`
	Content      string        `json:"content"`
	FunctionCall *FunctionCall `json:"function_call,omitempty"`
}

type FunctionCall struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type MessagePayload struct {
	Text []Message `json:"text"`
}

type RequestParameter struct {
	Chat ChatParameter `json:"chat"`
}

type ChatParameter struct {
	Domain      string   `json:"domain"`
	MaxToken    *int     `json:"max_tokens,omitempty"`
	Temperature *float32 `json:"temperature,omitempty"`
	TopK        *int     `json:"top_k,omitempty"`
}

// ChatResponse is the websocket partial response body for sparkdesk
type ChatResponse struct {
	Header struct {
		Code    int    `json:"code" required:"true"`
		Message string `json:"message"`
		Sid     string `json:"sid"`
		Status  int    `json:"status"`
	} `json:"header"`
	Payload struct {
		Choices struct {
			Status int       `json:"status"`
			Seq    int       `json:"seq"`
			Text   []Message `json:"text"`
		} `json:"choices"`
		Usage struct {
			Text struct {
				QuestionTokens   int `json:"question_tokens"`
				PromptTokens     int `json:"prompt_tokens"`
				CompletionTokens int `json:"completion_tokens"`
				TotalTokens      int `json:"total_tokens"`
			}
		}
	}
}
