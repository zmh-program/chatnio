package web

import (
	"chat/adapter/chatgpt"
	"chat/globals"
	"chat/manager/conversation"
)

func UsingWebSegment(instance *conversation.Conversation) []globals.Message {
	segment := conversation.CopyMessage(instance.GetMessageSegment(12))

	if instance.IsEnableWeb() {
		segment = ChatWithWeb(func(message []globals.Message, token int) (string, error) {
			return chatgpt.NewChatInstanceFromConfig("gpt3").CreateChatRequest(&chatgpt.ChatProps{
				Model:   globals.GPT3TurboInstruct,
				Message: message,
				Token:   &token,
			})
		}, segment, globals.IsLongContextModel(instance.GetModel()))
	}

	return segment
}

func UsingWebNativeSegment(enable bool, message []globals.Message) []globals.Message {
	if enable {
		return ChatWithWeb(func(message []globals.Message, token int) (string, error) {
			return chatgpt.NewChatInstanceFromConfig("gpt3").CreateChatRequest(&chatgpt.ChatProps{
				Model:   globals.GPT3TurboInstruct,
				Message: message,
				Token:   &token,
			})
		}, message, false)
	} else {
		return message
	}
}
