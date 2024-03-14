package adapter

import (
	"chat/adapter/azure"
	"chat/adapter/baichuan"
	"chat/adapter/bing"
	"chat/adapter/claude"
	"chat/adapter/common"
	"chat/adapter/dashscope"
	"chat/adapter/hunyuan"
	"chat/adapter/midjourney"
	"chat/adapter/openai"
	"chat/adapter/palm2"
	"chat/adapter/skylark"
	"chat/adapter/slack"
	"chat/adapter/sparkdesk"
	"chat/adapter/zhinao"
	"chat/adapter/zhipuai"
	"chat/globals"
	"fmt"
)

var channelFactories = map[string]adaptercommon.FactoryCreator{
	globals.OpenAIChannelType:      openai.NewChatInstanceFromConfig,
	globals.AzureOpenAIChannelType: azure.NewChatInstanceFromConfig,
	globals.ClaudeChannelType:      claude.NewChatInstanceFromConfig,
	globals.SlackChannelType:       slack.NewChatInstanceFromConfig,
	globals.BingChannelType:        bing.NewChatInstanceFromConfig,
	globals.PalmChannelType:        palm2.NewChatInstanceFromConfig,
	globals.SparkdeskChannelType:   sparkdesk.NewChatInstanceFromConfig,
	globals.ChatGLMChannelType:     zhipuai.NewChatInstanceFromConfig,
	globals.QwenChannelType:        dashscope.NewChatInstanceFromConfig,
	globals.HunyuanChannelType:     hunyuan.NewChatInstanceFromConfig,
	globals.BaichuanChannelType:    baichuan.NewChatInstanceFromConfig,
	globals.SkylarkChannelType:     skylark.NewChatInstanceFromConfig,
	globals.ZhinaoChannelType:      zhinao.NewChatInstanceFromConfig,
	globals.MidjourneyChannelType:  midjourney.NewChatInstanceFromConfig,

	globals.MoonshotChannelType: openai.NewChatInstanceFromConfig, // openai format
	globals.GroqChannelType:     openai.NewChatInstanceFromConfig, // openai format
}

func createChatRequest(conf globals.ChannelConfig, props *adaptercommon.ChatProps, hook globals.Hook) error {
	props.Model = conf.GetModelReflect(props.OriginalModel)
	props.Proxy = conf.GetProxy()

	factoryType := conf.GetType()
	if factory, ok := channelFactories[factoryType]; ok {
		return factory(conf).CreateStreamChatRequest(props, hook)
	}

	return fmt.Errorf("unknown channel type %s (channel #%d)", conf.GetType(), conf.GetId())
}
