package bing

import (
	"fmt"
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint string
	Secret   string
}

func (c *ChatInstance) GetEndpoint() string {
	return fmt.Sprintf("%s/chat", c.Endpoint)
}

func NewChatInstance(endpoint, secret string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		Secret:   secret,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(viper.GetString("bing.endpoint"), viper.GetString("bing.secret"))
}
