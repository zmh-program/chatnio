package palm2

import (
	"chat/globals"
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

func NewChatInstanceFromConfig(conf globals.ChannelConfig) *ChatInstance {
	return NewChatInstance(
		conf.GetEndpoint(),
		conf.GetRandomSecret(),
	)
}
