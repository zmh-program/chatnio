package chatgpt

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

func (c *ChatInstance) Test() bool {
	result, err := c.CreateChatRequest(&ChatProps{
		Model:   globals.GPT3Turbo,
		Message: []globals.Message{{Role: globals.User, Content: "hi"}},
		Token:   utils.ToPtr(1),
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
