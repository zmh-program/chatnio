package web

import (
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"fmt"
	"time"
)

type Hook func(message []globals.Message, token int) (string, error)

func ChatWithWeb(message []globals.Message) []globals.Message {
	data := utils.GetSegmentString(
		SearchWebResult(message[len(message)-1].Content), 2048,
	)

	return utils.Insert(message, 0, globals.Message{
		Role: globals.System,
		Content: fmt.Sprintf("You will play the role of an AI Q&A assistant, where your knowledge base is not offline, but can be networked in real time, and you can provide real-time networked information with links to networked search sources."+
			"Current time: %s, Real-time internet search results: %s",
			time.Now().Format("2006-01-02 15:04:05"), data,
		),
	})
}

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
