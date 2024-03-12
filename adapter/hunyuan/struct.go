package hunyuan

import (
	factory "chat/adapter/common"
	"chat/globals"
	"chat/utils"
)

type ChatInstance struct {
	Endpoint  string
	AppId     int64
	SecretId  string
	SecretKey string
}

func (c *ChatInstance) GetAppId() int64 {
	return c.AppId
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func (c *ChatInstance) GetSecretId() string {
	return c.SecretId
}

func (c *ChatInstance) GetSecretKey() string {
	return c.SecretKey
}

func NewChatInstance(endpoint, appId, secretId, secretKey string) *ChatInstance {
	return &ChatInstance{
		Endpoint:  endpoint,
		AppId:     utils.ParseInt64(appId),
		SecretId:  secretId,
		SecretKey: secretKey,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	params := conf.SplitRandomSecret(3)
	return NewChatInstance(
		conf.GetEndpoint(),
		params[0], params[1], params[2],
	)
}
