package adapter

import (
	"chat/adapter/chatgpt"
	"chat/globals"
	"chat/utils"
	"github.com/spf13/viper"
)

type ChatProps struct {
	Model      string
	Reversible bool
	Infinity   bool
	Message    []globals.Message
}

type Hook func(data string) error

func NewChatRequest(props *ChatProps, hook Hook) error {
	if globals.IsClaudeModel(props.Model) {
		return nil // work in progress
	} else if globals.IsChatGPTModel(props.Model) {
		instance := chatgpt.NewChatInstanceFromModel(&chatgpt.InstanceProps{
			Model:      props.Model,
			Reversible: props.Reversible,
		})
		return instance.CreateStreamChatRequest(&chatgpt.ChatProps{
			Model: utils.Multi(
				props.Reversible && globals.IsGPT4NativeModel(props.Model),
				viper.GetString("openai.reverse.hash"),
				props.Model,
			),
			Message: props.Message,
			Token:   utils.Multi(globals.IsGPT4Model(props.Model) || props.Reversible || props.Infinity, -1, 2000),
		}, hook)
	} else {
		return nil
	}
}
