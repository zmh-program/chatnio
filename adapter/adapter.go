package adapter

import (
	"chat/adapter/chatgpt"
	"chat/adapter/slack"
	"chat/adapter/sparkdesk"
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

func NewChatRequest(props *ChatProps, hook globals.Hook) error {
	if globals.IsClaudeModel(props.Model) {
		instance := slack.NewChatInstanceFromConfig()
		return instance.CreateStreamChatRequest(&slack.ChatProps{
			Message: props.Message,
		}, hook)

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

	} else if globals.IsSparkDeskModel(props.Model) {
		return sparkdesk.NewChatInstance().CreateStreamChatRequest(&sparkdesk.ChatProps{
			Message: props.Message,
			Token:   2048,
		}, hook)

	} else {
		return nil
	}
}
