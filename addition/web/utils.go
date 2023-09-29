package web

import (
	"chat/adapter/chatgpt"
	"chat/globals"
	"chat/manager/conversation"
)

func UsingWebSegment(instance *conversation.Conversation) (string, []globals.Message) {
	var keyword string
	var segment []globals.Message

	if instance.IsEnableWeb() {
		keyword, segment = ChatWithWeb(func(message []globals.Message, token int) (string, error) {
			return chatgpt.NewChatInstanceFromConfig("gpt3").CreateChatRequest(&chatgpt.ChatProps{
				Model:   globals.GPT3Turbo0613,
				Message: message,
				Token:   token,
			})
		}, conversation.CopyMessage(instance.GetMessageSegment(12)), globals.IsLongContextModel(instance.GetModel()))
	} else {
		segment = conversation.CopyMessage(instance.GetMessageSegment(12))
	}
	return keyword, segment
}

func UsingWebNativeSegment(enable bool, message []globals.Message) (string, []globals.Message) {
	if enable {
		return ChatWithWeb(func(message []globals.Message, token int) (string, error) {
			return chatgpt.NewChatInstanceFromConfig("gpt3").CreateChatRequest(&chatgpt.ChatProps{
				Model:   globals.GPT3Turbo0613,
				Message: message,
				Token:   token,
			})
		}, message, false)
	} else {
		return "", message
	}
}
