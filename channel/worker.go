package channel

import (
	"chat/adapter"
	"chat/globals"
	"chat/utils"
	"fmt"
)

func NewChatRequest(props *adapter.ChatProps, hook globals.Hook) error {
	if !ManagerInstance.HasChannel(props.Model) {
		return fmt.Errorf("cannot find channel for model %s", props.Model)
	}

	ticker := ManagerInstance.GetTicker(props.Model)

	var err error
	for !ticker.IsDone() {
		if channel := ticker.Next(); channel != nil {
			props.MaxRetries = utils.ToPtr(channel.GetRetry())
			if err = adapter.NewChatRequest(channel, props, hook); err == nil {
				return nil
			}
			fmt.Println(fmt.Sprintf("[channel] hit error %s for model %s, goto next channel", err.Error(), props.Model))
		}
	}

	return err
}
