package adapter

import (
	"chat/adapter/chatgpt"
	"chat/adapter/sparkdesk"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"
)

var MaxRetries = 5

func IsAvailableError(err error) bool {
	return err != nil && err.Error() != "signal"
}

// retryChatGPTPool is a function that provides a retry mechanism for chatgpt accounts that have been rate limited.
func retryChatGPTPool(props *ChatProps, hook globals.Hook, retry int) error {
	instance := chatgpt.NewChatInstanceFromModel(&chatgpt.InstanceProps{
		Model: props.Model,
		Plan:  props.Plan,
	})
	err := instance.CreateStreamChatRequest(&chatgpt.ChatProps{
		Model:   props.Model,
		Message: props.Message,
		Token: utils.Multi(
			props.Token == 0,
			utils.Multi(globals.IsGPT4Model(props.Model) || props.Plan || props.Infinity, -1, 2500),
			props.Token,
		),
	}, hook)

	if IsAvailableError(err) && retry < MaxRetries {
		fmt.Println(fmt.Sprintf("retrying chatgpt pool (times: %d, error: %s)", retry+1, err.Error()))
		return retryChatGPTPool(props, hook, retry+1)
	}

	return err
}

func createRetryChatGPTPool(props *ChatProps, hook globals.Hook) error {
	return retryChatGPTPool(props, hook, 0)
}

func isSparkDeskQPSOverLimit(err error) bool {
	return IsAvailableError(err) && strings.Contains(err.Error(), "AppIdQpsOverFlowError")
}

// retrySparkDesk is a function that provides a retry mechanism for sparkdesk accounts that have been qps limited.
func retrySparkDesk(props *ChatProps, hook globals.Hook, retry int) error {
	err := sparkdesk.NewChatInstance(props.Model).CreateStreamChatRequest(&sparkdesk.ChatProps{
		Message: props.Message,
		Token:   utils.Multi(props.Token == 0, 2500, props.Token),
	}, hook)

	// retry if qps limit forever
	if isSparkDeskQPSOverLimit(err) {
		// sleep for 0.5s to avoid qps limit
		time.Sleep(500 * time.Millisecond)

		fmt.Println(fmt.Sprintf("retrying sparkdesk pool (times: %d, error: %s)", retry, err.Error()))
		return retrySparkDesk(props, hook, retry+1)
	}

	return err
}

func createRetrySparkDesk(props *ChatProps, hook globals.Hook) error {
	return retrySparkDesk(props, hook, 0)
}
