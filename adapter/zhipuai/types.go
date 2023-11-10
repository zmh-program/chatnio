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
	Prompt []globals.Message `json:"prompt"`
}

type Occurrence struct {
	Code    int    `json:"code"`
	Msg     string `json:"msg"`
	Success bool   `json:"success"`
}
