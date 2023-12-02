package web

import (
	"chat/globals"
	"chat/manager/conversation"
)

func UsingWebSegment(instance *conversation.Conversation) []globals.Message {
	segment := conversation.CopyMessage(instance.GetChatMessage())

	if instance.IsEnableWeb() {
		segment = ChatWithWeb(segment, globals.IsLongContextModel(instance.GetModel()))
	}

	return segment
}

func UsingWebNativeSegment(enable bool, message []globals.Message) []globals.Message {
	if enable {
		return ChatWithWeb(message, false)
	} else {
		return message
	}
}
