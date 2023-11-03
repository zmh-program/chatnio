package oneapi

import (
	"chat/globals"
	"chat/utils"
)

type AdapterProps struct {
	Model    string
	Plan     bool
	Infinity bool
	Message  []globals.Message
	Token    int
}

func HandleRequest(props *AdapterProps, hook globals.Hook) error {
	instance := NewChatInstanceFromConfig()
	return instance.CreateStreamChatRequest(&ChatProps{
		Model:   instance.FormatModel(props.Model),
		Message: instance.FormatMessage(props.Message),
		Token:   utils.Multi(props.Token == 0, instance.GetToken(props.Model), props.Token),
	}, func(data string) error {
		return hook(instance.Process(data))
	})
}

func Handle(props interface{}, hook globals.Hook) error {
	conv := utils.MapToStruct[AdapterProps](props)
	return HandleRequest(conv, hook)
}
