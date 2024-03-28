package azure

import (
	factory "chat/adapter/common"
	"chat/globals"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
	Resource string
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func (c *ChatInstance) GetApiKey() string {
	return c.ApiKey
}

func (c *ChatInstance) GetResource() string {
	return c.Resource
}

func (c *ChatInstance) GetHeader() map[string]string {
	return map[string]string{
		"Content-Type": "application/json",
		"api-key":      c.GetApiKey(),
	}
}

func NewChatInstance(endpoint, apiKey string, resource string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apiKey,
		Resource: resource,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	param := conf.SplitRandomSecret(2)
	return NewChatInstance(
		conf.GetEndpoint(),
		param[0],
		param[1],
	)
}
