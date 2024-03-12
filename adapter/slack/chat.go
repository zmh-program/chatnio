package slack

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"context"
)

func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, hook globals.Hook) error {
	if err := c.Instance.NewChannel(c.GetChannel()); err != nil {
		return err
	}

	resp, err := c.Instance.Reply(context.Background(), c.FormatMessage(props.Message), nil)
	if err != nil {
		return err
	}

	return c.ProcessPartialResponse(resp, hook)
}
