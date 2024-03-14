package adaptercommon

import (
	"chat/globals"
	"chat/utils"
)

type RequestProps struct {
	MaxRetries *int
	Current    int
	Group      string

	Proxy globals.ProxyConfig
}

type ChatProps struct {
	RequestProps

	Model         string
	OriginalModel string

	Message           []globals.Message
	MaxTokens         *int
	PresencePenalty   *float32
	FrequencyPenalty  *float32
	RepetitionPenalty *float32
	Temperature       *float32
	TopP              *float32
	TopK              *int
	Tools             *globals.FunctionTools
	ToolChoice        *interface{}
	Buffer            utils.Buffer
}
