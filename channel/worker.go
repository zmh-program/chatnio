package channel

import (
	"chat/adapter"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
)

func NewChatRequest(props *adapter.ChatProps, hook globals.Hook) error {
	if !ConduitInstance.HasChannel(props.Model) {
		return fmt.Errorf("cannot find channel for model %s", props.Model)
	}

	ticker := ConduitInstance.GetTicker(props.Model)

	debug := viper.GetBool("debug")

	var err error
	for !ticker.IsDone() {
		if channel := ticker.Next(); channel != nil {
			if debug {
				fmt.Println(fmt.Sprintf("[channel] try channel %s for model %s", channel.GetName(), props.Model))
			}

			props.MaxRetries = utils.ToPtr(channel.GetRetry())
			if err = adapter.NewChatRequest(channel, props, hook); err == nil {
				if debug {
					fmt.Println(fmt.Sprintf("[channel] hit channel %s for model %s", channel.GetName(), props.Model))
				}

				return nil
			}
			fmt.Println(fmt.Sprintf("[channel] caught error %s for model %s at channel %s -> goto next channel", err.Error(), props.Model, channel.GetName()))
		}
	}

	if debug {
		fmt.Println(fmt.Sprintf("[channel] channels are exhausted for model %s", props.Model))
	}
	return err
}
