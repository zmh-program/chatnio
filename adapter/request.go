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

func getRetries(retries *int) int {
	if retries == nil {
		return defaultMaxRetries
	}

	return *retries
}

func NewChatRequest(props *ChatProps, hook globals.Hook) error {
	err := createChatRequest(props, hook)

	retries := getRetries(props.MaxRetries)
	props.Current++
	if props.Current > 1 {
		fmt.Println(fmt.Sprintf("retrying chat request for %s (attempt %d/%d, error: %s)", props.Model, props.Current, retries, err.Error()))
	}

	if IsAvailableError(err) {
		if isQPSOverLimit(props.Model, err) {
			// sleep for 0.5s to avoid qps limit

			time.Sleep(500 * time.Millisecond)
			return NewChatRequest(props, hook)
		}

		if props.Current < retries {
			return NewChatRequest(props, hook)
		}
	}

	return err
}
