package midjourney

import (
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint  string
	ApiSecret string
}

func (c *ChatInstance) GetApiSecret() string {
	return c.ApiSecret
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func NewChatInstance(endpoint string, apiSecret string) *ChatInstance {
	return &ChatInstance{
		Endpoint:  endpoint,
		ApiSecret: apiSecret,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("midjourney.endpoint"),
		viper.GetString("midjourney.api_secret"),
	)
}
