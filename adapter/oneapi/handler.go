package oneapi

import (
	"chat/globals"
)

type AdapterProps struct {
	Model            string
	Plan             bool
	Infinity         bool
	Message          []globals.Message
	Token            *int
	PresencePenalty  *float32
	FrequencyPenalty *float32
	Temperature      *float32
	TopP             *float32
	Tools            *globals.FunctionTools
	ToolChoice       *interface{}
}

func HandleRequest(props *AdapterProps, hook globals.Hook) error {
	instance := NewChatInstanceFromConfig()
	return instance.CreateStreamChatRequest(&ChatProps{
		Model:            instance.FormatModel(props.Model),
		Message:          instance.FormatMessage(props.Message),
		Token:            props.Token,
		PresencePenalty:  props.PresencePenalty,
		FrequencyPenalty: props.FrequencyPenalty,
		Temperature:      props.Temperature,
		TopP:             props.TopP,
		Tools:            props.Tools,
		ToolChoice:       props.ToolChoice,
	}, func(data string) error {
		return hook(instance.Process(data))
	})
}
