package types

import "chat/utils"

const (
	GPT3Turbo        = "gpt-3.5-turbo"
	GPT3Turbo0613    = "gpt-3.5-turbo-0613"
	GPT3Turbo0301    = "gpt-3.5-turbo-0301"
	GPT3Turbo16k     = "gpt-3.5-turbo-16k"
	GPT3Turbo16k0613 = "gpt-3.5-turbo-16k-0613"
	GPT3Turbo16k0301 = "gpt-3.5-turbo-16k-0301"
	GPT4             = "gpt-4"
	GPT40314         = "gpt-4-0314"
	GPT40613         = "gpt-4-0613"
	GPT432k          = "gpt-4-32k"
	GPT432k0314      = "gpt-4-32k-0314"
	GPT432k0613      = "gpt-4-32k-0613"
	Dalle            = "dalle"
)

var GPT3TurboArray = []string{
	GPT3Turbo,
	GPT3Turbo0613,
	GPT3Turbo0301,
}

var GPT3Turbo16kArray = []string{
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
}

var GPT4Array = []string{
	GPT4,
	GPT40314,
	GPT40613,
}

var GPT432kArray = []string{
	GPT432k,
	GPT432k0314,
	GPT432k0613,
}

func IsGPT4Model(model string) bool {
	return utils.Contains(model, GPT4Array) || utils.Contains(model, GPT432kArray)
}

func IsGPT3TurboModel(model string) bool {
	return utils.Contains(model, GPT3TurboArray) || utils.Contains(model, GPT3Turbo16kArray)
}
