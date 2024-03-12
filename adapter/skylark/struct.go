package skylark

import (
	factory "chat/adapter/common"
	"chat/globals"
	"github.com/volcengine/volc-sdk-golang/service/maas"
	"strings"
)

const (
	defaultHost   = "maas-api.ml-platform-cn-beijing.volces.com"
	defaultRegion = "cn-beijing"
)

type ChatInstance struct {
	Instance *maas.MaaS
}

func getHost(endpoint string) string {
	seg := strings.Split(endpoint, "://")
	if len(seg) > 1 && seg[1] != "" {
		return seg[1]
	}

	return defaultHost
}

func getRegion(endpoint string) string {
	host := getHost(endpoint)
	seg := strings.TrimSuffix(strings.TrimPrefix(host, "maas-api.ml-platform-"), ".volces.com")
	if seg != "" {
		return seg
	}

	return defaultRegion
}

func NewChatInstance(endpoint, accessKey, secretKey string) *ChatInstance {
	instance := maas.NewInstance(getHost(endpoint), getRegion(endpoint))
	instance.SetAccessKey(accessKey)
	instance.SetSecretKey(secretKey)
	return &ChatInstance{
		Instance: instance,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	params := conf.SplitRandomSecret(2)

	return NewChatInstance(
		conf.GetEndpoint(),
		params[0], params[1],
	)
}
