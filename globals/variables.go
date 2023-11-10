package globals

import (
	"github.com/gin-gonic/gin"
	"net/url"
	"strings"
)

const ChatMaxThread = 5
const AnonymousMaxThread = 1

var AllowedOrigins = []string{
	"chatnio.net",
	"nextweb.chatnio.net",
	"fystart.cn",
	"fystart.com",
}

func OriginIsAllowed(uri string) bool {
	instance, _ := url.Parse(uri)
	if instance == nil {
		return false
	}

	if instance.Hostname() == "localhost" || instance.Scheme == "file" {
		return true
	}

	if strings.HasPrefix(instance.Host, "www.") {
		instance.Host = instance.Host[4:]
	}

	return in(instance.Host, AllowedOrigins)
}

func OriginIsOpen(c *gin.Context) bool {
	return strings.HasPrefix(c.Request.URL.Path, "/v1")
}

const (
	GPT3Turbo         = "gpt-3.5-turbo"
	GPT3TurboInstruct = "gpt-3.5-turbo-instruct"
	GPT3Turbo0613     = "gpt-3.5-turbo-0613"
	GPT3Turbo0301     = "gpt-3.5-turbo-0301"
	GPT3Turbo1106     = "gpt-3.5-turbo-1106"
	GPT3Turbo16k      = "gpt-3.5-turbo-16k"
	GPT3Turbo16k0613  = "gpt-3.5-turbo-16k-0613"
	GPT3Turbo16k0301  = "gpt-3.5-turbo-16k-0301"
	GPT4              = "gpt-4"
	GPT4All           = "gpt-4-all"
	GPT4Vision        = "gpt-4-v"
	GPT4Dalle         = "gpt-4-dalle"
	GPT40314          = "gpt-4-0314"
	GPT40613          = "gpt-4-0613"
	GPT41106Preview   = "gpt-4-1106-preview"
	GPT432k           = "gpt-4-32k"
	GPT432k0314       = "gpt-4-32k-0314"
	GPT432k0613       = "gpt-4-32k-0613"
	Dalle2            = "dalle"
	Claude1           = "claude-1"
	Claude1100k       = "claude-1.3"
	Claude2           = "claude-1-100k"
	Claude2100k       = "claude-2"
	ClaudeSlack       = "claude-slack"
	SparkDesk         = "spark-desk-v1.5"
	SparkDeskV2       = "spark-desk-v2"
	SparkDeskV3       = "spark-desk-v3"
	ChatBison001      = "chat-bison-001"
	BingCreative      = "bing-creative"
	BingBalanced      = "bing-balanced"
	BingPrecise       = "bing-precise"
	ZhiPuChatGLMTurbo = "zhipu-chatglm-turbo"
	ZhiPuChatGLMPro   = "zhipu-chatglm-pro"
	ZhiPuChatGLMStd   = "zhipu-chatglm-std"
	ZhiPuChatGLMLite  = "zhipu-chatglm-lite"
	QwenTurbo         = "qwen-turbo"
	QwenPlus          = "qwen-plus"
	QwenTurboNet      = "qwen-turbo-net"
	QwenPlusNet       = "qwen-plus-net"
)

var GPT3TurboArray = []string{
	GPT3Turbo,
	GPT3TurboInstruct,
	GPT3Turbo0613,
	GPT3Turbo0301,
	GPT3Turbo1106,
}

var GPT3Turbo16kArray = []string{
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
}

var GPT4Array = []string{
	GPT4, GPT40314, GPT40613, GPT41106Preview,
	GPT4Vision, GPT4Dalle, GPT4All,
}

var GPT432kArray = []string{
	GPT432k,
	GPT432k0314,
	GPT432k0613,
}

var ClaudeModelArray = []string{
	Claude1, Claude1100k,
	Claude2, Claude2100k,
}

var BingModelArray = []string{
	BingCreative,
	BingBalanced,
	BingPrecise,
}

var ZhiPuModelArray = []string{
	ZhiPuChatGLMTurbo,
	ZhiPuChatGLMPro,
	ZhiPuChatGLMStd,
	ZhiPuChatGLMLite,
}

var SparkDeskModelArray = []string{
	SparkDesk,
	SparkDeskV2,
	SparkDeskV3,
}

var QwenModelArray = []string{
	QwenTurbo,
	QwenPlus,
	QwenTurboNet,
	QwenPlusNet,
}

var LongContextModelArray = []string{
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
	GPT432k,
	GPT432k0314,
	GPT432k0613,
	Claude1,
	Claude1100k,
	Claude2,
	Claude2100k,
}

var FreeModelArray = []string{
	GPT3Turbo,
	GPT3TurboInstruct,
	GPT3Turbo0613,
	GPT3Turbo0301,
	GPT3Turbo1106,
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
	Claude1,
	Claude2,
	ChatBison001,
	BingCreative,
	BingBalanced,
	BingPrecise,
	ZhiPuChatGLMLite,
}

var AllModels = []string{
	GPT3Turbo,
	GPT3TurboInstruct,
	GPT3Turbo0613,
	GPT3Turbo0301,
	GPT3Turbo1106,
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
	GPT4,
	GPT40314,
	GPT40613,
	GPT4Vision,
	GPT4All,
	GPT41106Preview,
	GPT4Dalle,
	GPT432k,
	GPT432k0314,
	GPT432k0613,
	Dalle2,
	Claude1,
	Claude1100k,
	Claude2,
	Claude2100k,
	ClaudeSlack,
	SparkDesk,
	SparkDeskV2,
	SparkDeskV3,
	ChatBison001,
	BingCreative,
	BingBalanced,
	BingPrecise,
	ZhiPuChatGLMTurbo,
	ZhiPuChatGLMPro,
	ZhiPuChatGLMStd,
	ZhiPuChatGLMLite,
	QwenTurbo,
	QwenPlus,
	QwenTurboNet,
	QwenPlusNet,
}

func in(value string, slice []string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

func IsGPT4Model(model string) bool {
	return in(model, GPT4Array) || in(model, GPT432kArray)
}

func IsGPT4NativeModel(model string) bool {
	return in(model, GPT4Array)
}

func IsGPT3TurboModel(model string) bool {
	return in(model, GPT3TurboArray) || in(model, GPT3Turbo16kArray) || model == Dalle2
}

func IsChatGPTModel(model string) bool {
	return IsGPT3TurboModel(model) || IsGPT4Model(model)
}

func IsClaudeModel(model string) bool {
	return in(model, ClaudeModelArray)
}

func IsClaude100KModel(model string) bool {
	return model == Claude1100k || model == Claude2100k
}

func IsSlackModel(model string) bool {
	return model == ClaudeSlack
}

func IsSparkDeskModel(model string) bool {
	return in(model, SparkDeskModelArray)
}

func IsPalm2Model(model string) bool {
	return model == ChatBison001
}

func IsBingModel(model string) bool {
	return in(model, BingModelArray)
}

func IsZhiPuModel(model string) bool {
	return in(model, ZhiPuModelArray)
}

func IsQwenModel(model string) bool {
	return in(model, QwenModelArray)
}

func IsLongContextModel(model string) bool {
	return in(model, LongContextModelArray)
}

func IsFreeModel(model string) bool {
	return in(model, FreeModelArray)
}
