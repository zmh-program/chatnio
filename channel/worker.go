package channel

import (
	"chat/adapter"
	"chat/globals"
	"chat/utils"
	"fmt"
)

func NewChatRequest(group string, props *adapter.ChatProps, hook globals.Hook) error {
	ticker := ConduitInstance.GetTicker(props.Model, group)
	if ticker == nil || ticker.IsEmpty() {
		return fmt.Errorf("cannot find channel for model %s", props.Model)
	}

	var err error
	for !ticker.IsDone() {
		if channel := ticker.Next(); channel != nil {
			props.MaxRetries = utils.ToPtr(channel.GetRetry())
			if err = adapter.NewChatRequest(channel, props, hook); err == nil || err.Error() == "signal" {
				return nil
			}

			globals.Warn(fmt.Sprintf("[channel] caught error %s for model %s at channel %s", err.Error(), props.Model, channel.GetName()))
		}
	}

	globals.Info(fmt.Sprintf("[channel] channels are exhausted for model %s", props.Model))
	return err
}
