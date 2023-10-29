package chatgpt

import "C"
import (
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
	Token   int
}

func (c *ChatInstance) GetChatEndpoint() string {
	return fmt.Sprintf("%s/v1/chat/completions", c.GetEndpoint())
}

func (c *ChatInstance) GetChatBody(props *ChatProps, stream bool) interface{} {
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

func (c *ChatInstance) ProcessLine(buf, data string) (string, error) {
	rep := strings.NewReplacer(
		"data: {",
		"\"data\": {",
	)
	item := rep.Replace(data)
	if !strings.HasPrefix(item, "{") {
		item = "{" + item
	}
	if !strings.HasSuffix(item, "}}") {
		item = item + "}"
	}

	if item == "{data: [DONE]}" || item == "{data: [DONE]}}" || item == "{[DONE]}" {
		return "", nil
	} else if item == "{data:}" || item == "{data:}}" {
		return "", nil
	}

	var form *ChatStreamResponse
	if form = utils.UnmarshalForm[ChatStreamResponse](item); form == nil {
		if form = utils.UnmarshalForm[ChatStreamResponse](item[:len(item)-1]); form == nil {
			if len(buf) > 0 {
				return c.ProcessLine("", buf+item)
			}

			globals.Warn(fmt.Sprintf("chatgpt error: cannot parse response: %s", item))
			return data, errors.New("cannot parse response")
		}
	}

	if len(form.Data.Choices) == 0 {
		return "", nil
	}

	return form.Data.Choices[0].Delta.Content, nil
}

// CreateChatRequest is the native http request body for chatgpt
func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	res, err := utils.Post(
		c.GetChatEndpoint(),
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

	return utils.EventSource(
		"POST",
		c.GetChatEndpoint(),
		c.GetHeader(),
		c.GetChatBody(props, true),
		func(data string) error {
			data, err := c.ProcessLine(buf, data)

			if err != nil {
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
