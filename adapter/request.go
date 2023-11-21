package adapter

import (
	"chat/globals"
	"chat/utils"
)

func IsAvailableError(err error) bool {
	return err != nil && err.Error() != "signal"
}

func NewChatRequest(props *ChatProps, hook globals.Hook) error {
	err := createChatRequest(props, hook)

	props.Current++
	retries := utils.Multi(props.MaxRetries == nil, defaultMaxRetries, *props.MaxRetries)

	if IsAvailableError(err) && props.Current < retries {
		return NewChatRequest(props, hook)
	}

	return err
}
