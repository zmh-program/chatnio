package adapter

import (
	"chat/globals"
)

func IsAvailableError(err error) bool {
	return err != nil && err.Error() != "signal"
}

func getRetries(retries *int) int {
	if retries == nil {
		return defaultMaxRetries
	}

	return *retries
}

func NewChatRequest(props *ChatProps, hook globals.Hook) error {
	err := createChatRequest(props, hook)

	props.Current++
	retries := getRetries(props.MaxRetries)

	if IsAvailableError(err) && props.Current < retries {
		return NewChatRequest(props, hook)
	}

	return err
}
