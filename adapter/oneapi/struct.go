package oneapi

import (
	"fmt"
	"github.com/spf13/viper"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
}

type InstanceProps struct {
	Model string
	Plan  bool
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func (c *ChatInstance) GetApiKey() string {
	return c.ApiKey
}

func (c *ChatInstance) GetHeader() map[string]string {
	return map[string]string{
		"Content-Type":  "application/json",
		"Authorization": fmt.Sprintf("Bearer %s", c.GetApiKey()),
	}
}

func NewChatInstance(endpoint, apiKey string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apiKey,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("oneapi.endpoint"),
		viper.GetString("oneapi.apikey"),
	)
}
