package claude

import (
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
}

func NewChatInstance(endpoint, apiKey string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apiKey,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("claude.endpoint"),
		viper.GetString("claude.apikey"),
	)
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func (c *ChatInstance) GetApiKey() string {
	return c.ApiKey
}
