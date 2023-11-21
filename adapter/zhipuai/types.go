package zhipuai

import "chat/globals"

const (
	ChatGLMTurbo = "chatglm_turbo"
	ChatGLMPro   = "chatglm_pro"
	ChatGLMStd   = "chatglm_std"
	ChatGLMLite  = "chatglm_lite"
)

type Payload struct {
	ApiKey    string `json:"api_key"`
	Exp       int64  `json:"exp"`
	TimeStamp int64  `json:"timestamp"`
}

type ChatRequest struct {
	Prompt      []globals.Message `json:"prompt"`
	Temperature *float32          `json:"temperature,omitempty"`
	TopP        *float32          `json:"top_p,omitempty"`
	Ref         *ChatRef          `json:"ref,omitempty"`
}

type ChatRef struct {
	Enable      *bool   `json:"enable,omitempty"`
	SearchQuery *string `json:"search_query,omitempty"`
}

type Occurrence struct {
	Code    int    `json:"code"`
	Msg     string `json:"msg"`
	Success bool   `json:"success"`
}
