package adapter

import (
	"chat/adapter/azure"
	"chat/adapter/baichuan"
	"chat/adapter/bing"
	"chat/adapter/chatgpt"
	"chat/adapter/claude"
	"chat/adapter/dashscope"
	"chat/adapter/hunyuan"
	"chat/adapter/midjourney"
	"chat/adapter/palm2"
	"chat/adapter/skylark"
	"chat/adapter/slack"
	"chat/adapter/sparkdesk"
	"chat/adapter/zhinao"
	"chat/adapter/zhipuai"
	"chat/globals"
	"chat/utils"
	"fmt"
)

type RequestProps struct {
	MaxRetries *int
	Current    int
	Group      string
}

type ChatProps struct {
	RequestProps

	Model             string
	Message           []globals.Message
	MaxTokens         *int
	PresencePenalty   *float32
	FrequencyPenalty  *float32
	RepetitionPenalty *float32
	Temperature       *float32
	TopP              *float32
	TopK              *int
	Tools             *globals.FunctionTools
	ToolChoice        *interface{}
	Buffer            utils.Buffer
}

func createChatRequest(conf globals.ChannelConfig, props *ChatProps, hook globals.Hook) error {
	model := conf.GetModelReflect(props.Model)

	switch conf.GetType() {
	case globals.OpenAIChannelType:
		return chatgpt.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&chatgpt.ChatProps{
			Model:            model,
			Message:          props.Message,
			Token:            props.MaxTokens,
			PresencePenalty:  props.PresencePenalty,
			FrequencyPenalty: props.FrequencyPenalty,
			Temperature:      props.Temperature,
			TopP:             props.TopP,
			Tools:            props.Tools,
			ToolChoice:       props.ToolChoice,
			Buffer:           props.Buffer,
		}, hook)

	case globals.AzureOpenAIChannelType:
		return azure.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&azure.ChatProps{
			Model:            model,
			Message:          props.Message,
			Token:            props.MaxTokens,
			PresencePenalty:  props.PresencePenalty,
			FrequencyPenalty: props.FrequencyPenalty,
			Temperature:      props.Temperature,
			TopP:             props.TopP,
			Tools:            props.Tools,
			ToolChoice:       props.ToolChoice,
			Buffer:           props.Buffer,
		}, hook)

	case globals.ClaudeChannelType:
		return claude.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&claude.ChatProps{
			Model:       model,
			Message:     props.Message,
			Token:       props.MaxTokens,
			TopP:        props.TopP,
			TopK:        props.TopK,
			Temperature: props.Temperature,
		}, hook)

	case globals.SlackChannelType:
		return slack.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&slack.ChatProps{
			Message: props.Message,
		}, hook)

	case globals.BingChannelType:
		return bing.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&bing.ChatProps{
			Model:   model,
			Message: props.Message,
		}, hook)

	case globals.PalmChannelType:
		return palm2.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&palm2.ChatProps{
			Model:   model,
			Message: props.Message,
		}, hook)

	case globals.SparkdeskChannelType:
		return sparkdesk.NewChatInstance(conf, model).CreateStreamChatRequest(&sparkdesk.ChatProps{
			Model:       model,
			Message:     props.Message,
			Token:       props.MaxTokens,
			Temperature: props.Temperature,
			TopK:        props.TopK,
			Tools:       props.Tools,
			Buffer:      props.Buffer,
		}, hook)

	case globals.ChatGLMChannelType:
		return zhipuai.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&zhipuai.ChatProps{
			Model:       model,
			Message:     props.Message,
			Temperature: props.Temperature,
			TopP:        props.TopP,
		}, hook)

	case globals.QwenChannelType:
		return dashscope.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&dashscope.ChatProps{
			Model:             model,
			Message:           props.Message,
			Token:             props.MaxTokens,
			Temperature:       props.Temperature,
			TopP:              props.TopP,
			TopK:              props.TopK,
			RepetitionPenalty: props.RepetitionPenalty,
		}, hook)

	case globals.HunyuanChannelType:
		return hunyuan.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&hunyuan.ChatProps{
			Model:       model,
			Message:     props.Message,
			Temperature: props.Temperature,
			TopP:        props.TopP,
		}, hook)

	case globals.BaichuanChannelType:
		return baichuan.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&baichuan.ChatProps{
			Model:       model,
			Message:     props.Message,
			TopP:        props.TopP,
			TopK:        props.TopK,
			Temperature: props.Temperature,
		}, hook)

	case globals.SkylarkChannelType:
		return skylark.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&skylark.ChatProps{
			Model:            model,
			Message:          props.Message,
			Token:            props.MaxTokens,
			TopP:             props.TopP,
			TopK:             props.TopK,
			Temperature:      props.Temperature,
			FrequencyPenalty: props.FrequencyPenalty,
			PresencePenalty:  props.PresencePenalty,
			RepeatPenalty:    props.RepetitionPenalty,
			Tools:            props.Tools,
		}, hook)

	case globals.ZhinaoChannelType:
		return zhinao.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&zhinao.ChatProps{
			Model:             model,
			Message:           props.Message,
			Token:             props.MaxTokens,
			TopP:              props.TopP,
			TopK:              props.TopK,
			Temperature:       props.Temperature,
			RepetitionPenalty: props.RepetitionPenalty,
		}, hook)

	case globals.MidjourneyChannelType:
		return midjourney.NewChatInstanceFromConfig(conf).CreateStreamChatRequest(&midjourney.ChatProps{
			Model:    model,
			Messages: props.Message,
		}, hook)

	default:
		return fmt.Errorf("unknown channel type %s (model: %s)", conf.GetType(), props.Model)
	}
}
