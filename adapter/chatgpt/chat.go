package chatgpt

import "C"
import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
	Token   int
}

func (c *ChatInstance) GetChatEndpoint(props *ChatProps) string {
	if props.Model == globals.GPT3TurboInstruct {
		return fmt.Sprintf("%s/v1/completions", c.GetEndpoint())
	}
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetCompletionPrompt(messages []globals.Message) string {
	result := ""
	for _, message := range messages {
		result += fmt.Sprintf("%s: %s\n", message.Role, message.Content)
	}
	return result
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) interface{} {
	if props.Model == globals.GPT3TurboInstruct {
		// for completions
		return utils.Multi[interface{}](props.Token != -1, CompletionRequest{
			Model:    props.Model,
			Prompt:   c.GetCompletionPrompt(props.Message),
			MaxToken: props.Token,
			Stream:   stream,
		}, CompletionWithInfinity{
			Model:  props.Model,
			Prompt: c.GetCompletionPrompt(props.Message),
			Stream: stream,
		})
	}

	if props.Token != -1 {
		return ChatRequest{
			Model:    props.Model,
			Messages: props.Message,
			MaxToken: props.Token,
			Stream:   stream,
		}
	}

	return ChatRequestWithInfinity{
		Model:    props.Model,
		Messages: props.Message,
		Stream:   stream,
	}
}

// CreateChatRequest is the native http request body for chatgpt
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(props),
		c.GetHeader(),
		c.GetChatBody(props, false),
	)

	if err != nil || res == nil {
		return "", fmt.Errorf("chatgpt error: %s", err.Error())
	}

	data := utils.MapToStruct[ChatResponse](res)
	if data == nil {
		return "", fmt.Errorf("chatgpt error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("chatgpt error: %s", data.Error.Message)
	}
	return data.Choices[0].Message.Content, nil
}

// CreateStreamChatRequest is the stream response body for chatgpt
func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	buf := ""
	instruct := props.Model == globals.GPT3TurboInstruct

	return utils.EventSource(
		"POST",
		c.GetChatEndpoint(props),
		c.GetHeader(),
		c.GetChatBody(props, true),
		func(data string) error {
			data, err := c.ProcessLine(instruct, buf, data)

			if err != nil {
				if strings.HasPrefix(err.Error(), "chatgpt error") {
					return err
				}

				// error when break line
				buf = buf + data
				return nil
			}

			buf = ""
			if data != "" {
				if err := callback(data); err != nil {
					return err
				}
			}
			return nil
		},
	)
}

func (c *ChatInstance) Test() bool {
	result, err := c.CreateChatRequest(&ChatProps{
		Model:   globals.GPT3Turbo,
		Message: []globals.Message{{Role: "user", Content: "hi"}},
		Token:   1,
	})
	if err != nil {
		fmt.Println(fmt.Sprintf("%s: test failed (%s)", c.GetApiKey(), err.Error()))
	}

	return err == nil && len(result) > 0
}

func FilterKeys(v string) []string {
	endpoint := viper.GetString(fmt.Sprintf("openai.%s.endpoint", v))
	keys := strings.Split(viper.GetString(fmt.Sprintf("openai.%s.apikey", v)), "|")

	return FilterKeysNative(endpoint, keys)
}

func FilterKeysNative(endpoint string, keys []string) []string {
	stack := make(chan string, len(keys))
	for _, key := range keys {
		go func(key string) {
			instance := NewChatInstance(endpoint, key)
			stack <- utils.Multi[string](instance.Test(), key, "")
		}(key)
	}

	var result []string
	for i := 0; i < len(keys); i++ {
		if res := <-stack; res != "" {
			result = append(result, res)
		}
	}
	return result
}
