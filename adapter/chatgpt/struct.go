package chatgpt

import (
	"chat/globals"
	"chat/utils"
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

func NewChatInstanceFromConfig(v string) *ChatInstance {
	return NewChatInstance(
		viper.GetString(fmt.Sprintf("openai.%s.endpoint", v)),
		utils.GetRandomKey(viper.GetString(fmt.Sprintf("openai.%s.apikey", v))),
	)
}

func NewChatInstanceFromModel(props *InstanceProps) *ChatInstance {
	switch props.Model {
	case globals.GPT4,
		globals.GPT4Vision,
		globals.GPT40314,
		globals.GPT40613:
		return NewChatInstanceFromConfig("gpt4")

	case globals.GPT432k,
		globals.GPT432k0613,
		globals.GPT432k0314:
		return NewChatInstanceFromConfig("32k")

	case globals.GPT3Turbo,
		globals.GPT3TurboInstruct,
		globals.GPT3Turbo0613,
		globals.GPT3Turbo0301,
		globals.GPT3Turbo16k,
		globals.GPT3Turbo16k0301,
		globals.GPT3Turbo16k0613:
		if props.Plan {
			return NewChatInstanceFromConfig("subscribe")
		}
		return NewChatInstanceFromConfig("gpt3")
	default:
		return NewChatInstanceFromConfig("gpt3")
	}
}
