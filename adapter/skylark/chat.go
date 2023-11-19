package skylark

import (
	"chat/globals"
	"chat/utils"
	"github.com/volcengine/volc-sdk-golang/service/maas/models/api"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
	Token   int
}

func (c *ChatInstance) CreateRequest(props *ChatProps) *api.ChatReq {
	return &api.ChatReq{
		Model: &api.Model{
			Name: props.Model,
		},
		Messages: utils.Each[globals.Message, *api.Message](props.Message, func(message globals.Message) *api.Message {
			return &api.Message{
				Role:    message.Role,
				Content: message.Content,
			}
		}),
		Parameters: &api.Parameters{
			MaxTokens: int64(props.Token),
		},
	}
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	req := c.CreateRequest(props)
	channel, err := c.Instance.StreamChat(req)
	if err != nil {
		return err
	}

	for partial := range channel {
		if partial.Error != nil {
			return partial.Error
		}

		if err := callback(partial.Choice.Message.Content); err != nil {
			return err
		}
	}

	return nil
}
