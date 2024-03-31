package adapter

import (
	"chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"
)

func IsAvailableError(err error) bool {
	return err != nil && (err.Error() != "signal" && !strings.Contains(err.Error(), "signal"))
}

func IsSkipError(err error) bool {
	return err == nil || (err.Error() == "signal" || strings.Contains(err.Error(), "signal"))
}

func isQPSOverLimit(model string, err error) bool {
	if strings.Contains(model, "spark-desk") {
		return strings.Contains(err.Error(), "AppIdQpsOverFlowError")
	}
	return false
}

func NewChatRequest(conf globals.ChannelConfig, props *adaptercommon.ChatProps, hook globals.Hook) error {
	err := createChatRequest(conf, props, hook)

	retries := conf.GetRetry()
	props.Current++

	if IsAvailableError(err) {
		if isQPSOverLimit(props.OriginalModel, err) {
			// sleep for 0.5s to avoid qps limit

			globals.Info(fmt.Sprintf("qps limit for %s, sleep and retry (times: %d)", props.OriginalModel, props.Current))
			time.Sleep(500 * time.Millisecond)
			return NewChatRequest(conf, props, hook)
		}

		if props.Current < retries {
			content := strings.Replace(err.Error(), "\n", "", -1)
			globals.Warn(fmt.Sprintf("retrying chat request for %s (attempt %d/%d, error: %s)", props.OriginalModel, props.Current+1, retries, content))
			return NewChatRequest(conf, props, hook)
		}
	}

	return conf.ProcessError(err)
}

func ClearMessages(model string, messages []globals.Message) []globals.Message {
	if globals.IsVisionModel(model) {
		return messages
	}

	return utils.Each[globals.Message](messages, func(message globals.Message) globals.Message {
		if message.Role != globals.User {
			return message
		}

		images := utils.ExtractBase64Images(message.Content)
		for _, image := range images {
			if len(image) <= 46 {
				continue
			}

			message.Content = strings.Replace(message.Content, image, utils.Extract(image, 46, " ..."), -1)
		}
		return message
	})
}
