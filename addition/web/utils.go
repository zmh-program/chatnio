package web

import (
	"chat/globals"
	"chat/manager/conversation"
)

func UsingWebSegment(instance *conversation.Conversation, restart bool) []globals.Message {
	segment := conversation.CopyMessage(instance.GetChatMessage(restart))

	if instance.IsEnableWeb() {
		segment = ChatWithWeb(segment)
	}

	return segment
}

func UsingWebNativeSegment(enable bool, message []globals.Message) []globals.Message {
	if enable {
		return ChatWithWeb(message)
	} else {
		return message
	}
}
