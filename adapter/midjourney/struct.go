package midjourney

import (
	"chat/globals"
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

func NewChatInstance(endpoint, apiSecret, whiteList string) *ChatInstance {
	SaveWhiteList(whiteList)

	return &ChatInstance{
		Endpoint:  endpoint,
		ApiSecret: apiSecret,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) *ChatInstance {
	params := conf.SplitRandomSecret(2)

	return NewChatInstance(
		conf.GetEndpoint(),
		params[0], params[1],
	)
}
