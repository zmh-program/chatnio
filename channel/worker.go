package channel

import (
	"chat/adapter"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/cloudwego/hertz/cmd/hz/util/logs"
)

func NewChatRequest(props *adapter.ChatProps, hook globals.Hook) error {
	if !ConduitInstance.HasChannel(props.Model) {
		return fmt.Errorf("cannot find channel for model %s", props.Model)
	}

	ticker := ConduitInstance.GetTicker(props.Model)

	var err error
	for !ticker.IsDone() {
		if channel := ticker.Next(); channel != nil {
			props.MaxRetries = utils.ToPtr(channel.GetRetry())
			if err = adapter.NewChatRequest(channel, props, hook); err == nil {
				return nil
			}

			logs.Warn(fmt.Sprintf("[channel] caught error %s for model %s at channel %s", err.Error(), props.Model, channel.GetName()))
		}
	}

	logs.Info(fmt.Sprintf("[channel] channels are exhausted for model %s", props.Model))
	return err
}
