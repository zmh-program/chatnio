package skylark

import (
	"github.com/spf13/viper"
	"github.com/volcengine/volc-sdk-golang/service/maas"
)

type ChatInstance struct {
	Instance *maas.MaaS
}

func NewChatInstance(accessKey, secretKey string) *ChatInstance {
	instance := maas.NewInstance("maas-api.ml-platform-cn-beijing.volces.com", "cn-beijing")
	instance.SetAccessKey(accessKey)
	instance.SetSecretKey(secretKey)
	return &ChatInstance{
		Instance: instance,
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("skylark.access_key"),
		viper.GetString("skylark.secret_key"),
	)
}
