package dashscope

import (
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
}

func (c *ChatInstance) GetApiKey() string {
	return c.ApiKey
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func NewChatInstance(endpoint string, apiKey string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apiKey,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("dashscope.endpoint"),
		viper.GetString("dashscope.apikey"),
	)
}
