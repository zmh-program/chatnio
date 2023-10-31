package adapter

import (
	"chat/adapter/bing"
	"chat/adapter/chatgpt"
	"chat/adapter/claude"
	"chat/adapter/palm2"
	"chat/adapter/slack"
	"chat/adapter/sparkdesk"
	"chat/adapter/zhipuai"
	"chat/globals"
	"chat/utils"
)

type ChatProps struct {
	Model    string
	Plan     bool
	Infinity bool
	Message  []globals.Message
	Token    int
}

func NewChatRequest(props *ChatProps, hook globals.Hook) error {
	if globals.IsChatGPTModel(props.Model) {
		instance := chatgpt.NewChatInstanceFromModel(&chatgpt.InstanceProps{
			Model: props.Model,
			Plan:  props.Plan,
		})
		return instance.CreateStreamChatRequest(&chatgpt.ChatProps{
			Model:   props.Model,
			Message: props.Message,
			Token: utils.Multi(
				props.Token == 0,
				utils.Multi(globals.IsGPT4Model(props.Model) || props.Plan || props.Infinity, -1, 2000),
				props.Token,
			),
		}, hook)

	} else if globals.IsClaudeModel(props.Model) {
		return claude.NewChatInstanceFromConfig().CreateStreamChatRequest(&claude.ChatProps{
			Model:   props.Model,
			Message: props.Message,
			Token:   utils.Multi(props.Token == 0, 50000, props.Token),
		}, hook)

	} else if globals.IsSparkDeskModel(props.Model) {
		return sparkdesk.NewChatInstance(props.Model).CreateStreamChatRequest(&sparkdesk.ChatProps{
			Message: props.Message,
			Token:   utils.Multi(props.Token == 0, 2500, props.Token),
		}, hook)

	} else if globals.IsPalm2Model(props.Model) {
		return palm2.NewChatInstanceFromConfig().CreateStreamChatRequest(&palm2.ChatProps{
			Model:   props.Model,
			Message: props.Message,
		}, hook)
	} else if globals.IsSlackModel(props.Model) {
		return slack.NewChatInstanceFromConfig().CreateStreamChatRequest(&slack.ChatProps{
			Message: props.Message,
		}, hook)
	} else if globals.IsBingModel(props.Model) {
		return bing.NewChatInstanceFromConfig().CreateStreamChatRequest(&bing.ChatProps{
			Model:   props.Model,
			Message: props.Message,
		}, hook)
	} else if globals.IsZhiPuModel(props.Model) {
		return zhipuai.NewChatInstanceFromConfig().CreateStreamChatRequest(&zhipuai.ChatProps{
			Model:   props.Model,
			Message: props.Message,
		}, hook)
	}

	return nil
}
