package slack

import (
	"chat/globals"
	"context"
	"github.com/spf13/viper"
)

type ChatProps struct {
	Message []globals.Message
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error {
	if err := c.Instance.NewChannel(viper.GetString("slack.channel")); err != nil {
		return err
	}

	resp, err := c.Instance.Reply(context.Background(), c.FormatMessage(props.Message), nil)
	if err != nil {
		return err
	}

	return c.ProcessPartialResponse(resp, hook)
}
