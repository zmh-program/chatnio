package adapter

import (
	"chat/adapter/baichuan"
	"chat/adapter/bing"
	"chat/adapter/chatgpt"
	"chat/adapter/claude"
	"chat/adapter/dashscope"
	"chat/adapter/hunyuan"
	"chat/adapter/midjourney"
	"chat/adapter/oneapi"
	"chat/adapter/palm2"
	"chat/adapter/skylark"
	"chat/adapter/slack"
	"chat/adapter/sparkdesk"
	"chat/adapter/zhinao"
	"chat/adapter/zhipuai"
	"chat/globals"
	"chat/utils"
)

var defaultMaxRetries = 3

type RequestProps struct {
	MaxRetries *int
	Current    int
}

type ChatProps struct {
	RequestProps

	Model             string
	Plan              bool
	Infinity          bool
	Message           []globals.Message
	Token             int
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

func createChatRequest(props *ChatProps, hook globals.Hook) error {
	if oneapi.IsHit(props.Model) {
		return oneapi.NewChatInstanceFromConfig().CreateStreamChatRequest(&oneapi.ChatProps{
			Model:   props.Model,
			Message: props.Message,
			Token: utils.Multi(
				props.Token == 0,
				utils.Multi(globals.IsGPT4Model(props.Model) || props.Plan || props.Infinity, nil, utils.ToPtr(2500)),
				&props.Token,
			),
			PresencePenalty:  props.PresencePenalty,
			FrequencyPenalty: props.FrequencyPenalty,
			Temperature:      props.Temperature,
			TopP:             props.TopP,
			Tools:            props.Tools,
			ToolChoice:       props.ToolChoice,
			Buffer:           props.Buffer,
		}, hook)

	} else if globals.IsChatGPTModel(props.Model) {
		instance := chatgpt.NewChatInstanceFromModel(&chatgpt.InstanceProps{
			Model: props.Model,
			Plan:  props.Plan,
		})
		return instance.CreateStreamChatRequest(&chatgpt.ChatProps{
			Model:   props.Model,
			Message: props.Message,
			Token: utils.Multi(
				props.Token == 0,
				utils.Multi(globals.IsGPT4Model(props.Model) || props.Plan || props.Infinity, nil, utils.ToPtr(2500)),
				&props.Token,
			),
			PresencePenalty:  props.PresencePenalty,
			FrequencyPenalty: props.FrequencyPenalty,
			Temperature:      props.Temperature,
			TopP:             props.TopP,
			Tools:            props.Tools,
			ToolChoice:       props.ToolChoice,
			Buffer:           props.Buffer,
		}, hook)

	} else if globals.IsClaudeModel(props.Model) {
		return claude.NewChatInstanceFromConfig().CreateStreamChatRequest(&claude.ChatProps{
			Model:       props.Model,
			Message:     props.Message,
			Token:       utils.Multi(props.Token == 0, 50000, props.Token),
			TopP:        props.TopP,
			TopK:        props.TopK,
			Temperature: props.Temperature,
		}, hook)

	} else if globals.IsSparkDeskModel(props.Model) {
		return sparkdesk.NewChatInstance(props.Model).CreateStreamChatRequest(&sparkdesk.ChatProps{
			Model:       props.Model,
			Message:     props.Message,
			Token:       utils.Multi(props.Token == 0, nil, utils.ToPtr(props.Token)),
			Temperature: props.Temperature,
			TopK:        props.TopK,
			Tools:       props.Tools,
			Buffer:      props.Buffer,
		}, hook)

	} else if globals.IsPalm2Model(props.Model) {
		return palm2.NewChatInstanceFromConfig().CreateStreamChatRequest(&palm2.ChatProps{
			Model:   props.Model,
			Message: props.Message,
		}, hook)

	} else if globals.IsSlackModel(props.Model) {
		return slack.NewChatInstanceFromConfig().CreateStreamChatRequest(&slack.ChatProps{
			Message: props.Message,
		}, hook)

	} else if globals.IsBingModel(props.Model) {
		return bing.NewChatInstanceFromConfig().CreateStreamChatRequest(&bing.ChatProps{
			Model:   props.Model,
			Message: props.Message,
		}, hook)

	} else if globals.IsZhiPuModel(props.Model) {
		return zhipuai.NewChatInstanceFromConfig().CreateStreamChatRequest(&zhipuai.ChatProps{
			Model:       props.Model,
			Message:     props.Message,
			Temperature: props.Temperature,
			TopP:        props.TopP,
		}, hook)

	} else if globals.IsQwenModel(props.Model) {
		return dashscope.NewChatInstanceFromConfig().CreateStreamChatRequest(&dashscope.ChatProps{
			Model:             props.Model,
			Message:           props.Message,
			Token:             utils.Multi(props.Infinity || props.Plan, nil, utils.ToPtr(2500)),
			Temperature:       props.Temperature,
			TopP:              props.TopP,
			TopK:              props.TopK,
			RepetitionPenalty: props.RepetitionPenalty,
		}, hook)

	} else if globals.IsMidjourneyModel(props.Model) {
		return midjourney.NewChatInstanceFromConfig().CreateStreamChatRequest(&midjourney.ChatProps{
			Model:    props.Model,
			Messages: props.Message,
		}, hook)

	} else if globals.IsHunyuanModel(props.Model) {
		return hunyuan.NewChatInstanceFromConfig().CreateStreamChatRequest(&hunyuan.ChatProps{
			Model:       props.Model,
			Message:     props.Message,
			Temperature: props.Temperature,
			TopP:        props.TopP,
		}, hook)

	} else if globals.Is360Model(props.Model) {
		return zhinao.NewChatInstanceFromConfig().CreateStreamChatRequest(&zhinao.ChatProps{
			Model:             props.Model,
			Message:           props.Message,
			Token:             utils.Multi(props.Infinity || props.Plan, nil, utils.ToPtr(2048)),
			TopP:              props.TopP,
			TopK:              props.TopK,
			Temperature:       props.Temperature,
			RepetitionPenalty: props.RepetitionPenalty,
		}, hook)

	} else if globals.IsBaichuanModel(props.Model) {
		return baichuan.NewChatInstanceFromConfig().CreateStreamChatRequest(&baichuan.ChatProps{
			Model:       props.Model,
			Message:     props.Message,
			TopP:        props.TopP,
			TopK:        props.TopK,
			Temperature: props.Temperature,
		}, hook)

	} else if globals.IsSkylarkModel(props.Model) {
		return skylark.NewChatInstanceFromConfig().CreateStreamChatRequest(&skylark.ChatProps{
			Model:            props.Model,
			Message:          props.Message,
			Token:            utils.Multi(props.Token == 0, 4096, props.Token),
			TopP:             props.TopP,
			TopK:             props.TopK,
			Temperature:      props.Temperature,
			FrequencyPenalty: props.FrequencyPenalty,
			PresencePenalty:  props.PresencePenalty,
			RepeatPenalty:    props.RepetitionPenalty,
			Tools:            props.Tools,
		}, hook)
	}

	return hook("Sorry, we cannot find the model you are looking for. Please try another model.")
}
