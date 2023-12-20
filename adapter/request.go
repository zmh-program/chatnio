package adapter

import (
	"chat/globals"
	"fmt"
	"strings"
	"time"
)

func IsAvailableError(err error) bool {
	return err != nil && err.Error() != "signal"
}

func isQPSOverLimit(model string, err error) bool {
	switch model {
	case globals.SparkDesk, globals.SparkDeskV2, globals.SparkDeskV3:
		return strings.Contains(err.Error(), "AppIdQpsOverFlowError")
	default:
		return false
	}
}

func NewChatRequest(conf globals.ChannelConfig, props *ChatProps, hook globals.Hook) error {
	err := createChatRequest(conf, props, hook)

	retries := conf.GetRetry()
	props.Current++

	if IsAvailableError(err) {
		if isQPSOverLimit(props.Model, err) {
			// sleep for 0.5s to avoid qps limit

			globals.Info(fmt.Sprintf("qps limit for %s, sleep and retry (times: %d)", props.Model, props.Current))
			time.Sleep(500 * time.Millisecond)
			return NewChatRequest(conf, props, hook)
		}

		if props.Current < retries {
			content := strings.Replace(err.Error(), "\n", "", -1)
			globals.Warn(fmt.Sprintf("retrying chat request for %s (attempt %d/%d, error: %s)", props.Model, props.Current+1, retries, content))
			return NewChatRequest(conf, props, hook)
		}
	}

	return conf.ProcessError(err)
}
