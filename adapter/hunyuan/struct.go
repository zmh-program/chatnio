package hunyuan

import "github.com/spf13/viper"

type ChatInstance struct {
	AppId     int64
	SecretId  string
	SecretKey string
}

func (c *ChatInstance) GetAppId() int64 {
	return c.AppId
}

func (c *ChatInstance) GetSecretId() string {
	return c.SecretId
}

func (c *ChatInstance) GetSecretKey() string {
	return c.SecretKey
}

func NewChatInstance(appId int64, secretId string, secretKey string) *ChatInstance {
	return &ChatInstance{
		AppId:     appId,
		SecretId:  secretId,
		SecretKey: secretKey,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetInt64("hunyuan.app_id"),
		viper.GetString("hunyuan.secret_id"),
		viper.GetString("hunyuan.secret_key"),
	)
}
