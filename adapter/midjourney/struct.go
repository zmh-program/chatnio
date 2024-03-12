package midjourney

import (
	factory "chat/adapter/common"
	"chat/globals"
	"fmt"
)

var midjourneyEmptySecret = "null"

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

func (c *ChatInstance) GetMidjourneyHeaders() map[string]string {
	secret := c.GetApiSecret()
	if secret == "" || secret == midjourneyEmptySecret {
		return map[string]string{
			"Content-Type": "application/json",
		}
	}

	return map[string]string{
		"Content-Type":  "application/json",
		"mj-api-secret": secret,
	}
}

func (c *ChatInstance) GetNotifyEndpoint() string {
	return fmt.Sprintf("%s/mj/notify", globals.NotifyUrl)
}

func NewChatInstance(endpoint, apiSecret, whiteList string) *ChatInstance {
	SaveWhiteList(whiteList)

	return &ChatInstance{
		Endpoint:  endpoint,
		ApiSecret: apiSecret,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	params := conf.SplitRandomSecret(2)

	return NewChatInstance(
		conf.GetEndpoint(),
		params[0], params[1],
	)
}
