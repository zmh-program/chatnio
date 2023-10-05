package bing

import (
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint string
	Cookies  *map[string]interface{}
}

func (c *ChatInstance) GetEndpoint() string {
	return fmt.Sprintf("%s/chat", c.Endpoint)
}

func NewChatInstance(endpoint, cookies string) *ChatInstance {
	form := utils.UnmarshalForm[map[string]interface{}](cookies)
	return &ChatInstance{
		Endpoint: endpoint,
		Cookies:  form,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(viper.GetString("bing.endpoint"), viper.GetString("bing.cookies"))
}
