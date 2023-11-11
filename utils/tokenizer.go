package utils

import (
	"chat/globals"
	"github.com/pkoukk/tiktoken-go"
	"strings"
)

//   Using https://github.com/pkoukk/tiktoken-go
//   To count number of tokens of openai chat messages
//   OpenAI Cookbook: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb

func GetWeightByModel(model string) int {
	switch model {
	case globals.GPT3TurboInstruct,
		globals.Claude1, globals.Claude1100k,
		globals.Claude2, globals.Claude2100k:
		return 2
	case globals.GPT3Turbo, globals.GPT3Turbo0613, globals.GPT3Turbo1106,
		globals.GPT3Turbo16k, globals.GPT3Turbo16k0613,
		globals.GPT4, globals.GPT4Vision, globals.GPT4Dalle, globals.GPT4All, globals.GPT40314, globals.GPT40613, globals.GPT41106Preview,
		globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314,
		globals.LLaMa27B, globals.LLaMa213B, globals.LLaMa270B,
		globals.CodeLLaMa34B, globals.CodeLLaMa13B, globals.CodeLLaMa7B,

		globals.SparkDesk, globals.SparkDeskV2, globals.SparkDeskV3,
		globals.QwenTurbo, globals.QwenPlus, globals.QwenTurboNet, globals.QwenPlusNet,
		globals.BingPrecise, globals.BingCreative, globals.BingBalanced:
		return 3
	case globals.GPT3Turbo0301, globals.GPT3Turbo16k0301,
		globals.ZhiPuChatGLMTurbo, globals.ZhiPuChatGLMLite, globals.ZhiPuChatGLMStd, globals.ZhiPuChatGLMPro:
		return 4 // every message follows <|start|>{role/name}\n{content}<|end|>\n
	default:
		if strings.Contains(model, globals.GPT3Turbo) {
			// warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.
			return GetWeightByModel(globals.GPT3Turbo0613)
		} else if strings.Contains(model, globals.GPT4) {
			// warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.
			return GetWeightByModel(globals.GPT40613)
		} else if strings.Contains(model, globals.Claude1) {
			// warning: claude-1 may update over time. Returning num tokens assuming claude-1-100k.
			return GetWeightByModel(globals.Claude1100k)
		} else if strings.Contains(model, globals.Claude2) {
			// warning: claude-2 may update over time. Returning num tokens assuming claude-2-100k.
			return GetWeightByModel(globals.Claude2100k)
		} else {
			// not implemented: See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens
			//panic(fmt.Errorf("not implemented for model %s", model))
			return 3
		}
	}
}
func NumTokensFromMessages(messages []globals.Message, model string) (tokens int) {
	weight := GetWeightByModel(model)
	tkm, err := tiktoken.EncodingForModel(model)
	if err != nil {
		// can not encode messages, use length of messages as a proxy for number of tokens
		// using rune instead of byte to account for unicode characters (e.g. emojis, non-english characters)

		data := Marshal(messages)
		return len([]rune(data)) * weight
	}

	for _, message := range messages {
		tokens += weight
		tokens += len(tkm.Encode(message.Content, nil, nil))
		tokens += len(tkm.Encode(message.Role, nil, nil))
	}
	tokens += 3 // every reply is primed with <|start|>assistant<|message|>
	return tokens
}

func CountTokenPrice(messages []globals.Message, model string) int {
	return NumTokensFromMessages(messages, model)
}

func CountInputToken(model string, v []globals.Message) float32 {
	switch model {
	case globals.GPT3Turbo, globals.GPT3Turbo0613, globals.GPT3Turbo0301, globals.GPT3TurboInstruct, globals.GPT3Turbo1106,
		globals.GPT3Turbo16k, globals.GPT3Turbo16k0613, globals.GPT3Turbo16k0301:
		return 0
	case globals.GPT41106Preview:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.7 * 0.6
	case globals.GPT4, globals.GPT4Vision, globals.GPT4All, globals.GPT4Dalle, globals.GPT40314, globals.GPT40613:
		return float32(CountTokenPrice(v, model)) / 1000 * 2.1 * 0.6
	case globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314:
		return float32(CountTokenPrice(v, model)) / 1000 * 4.2
	case globals.SparkDesk:
		return 0 // float32(CountTokenPrice(v, model)) / 1000 * 0.15 free now
	case globals.SparkDeskV2, globals.SparkDeskV3:
		return 0 // float32(CountTokenPrice(v, model)) / 1000 * 0.3 free now
	case globals.Claude1, globals.Claude2:
		return 0
	case globals.Claude1100k, globals.Claude2100k:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.8 * 0.6
	case globals.LLaMa270B, globals.CodeLLaMa34B:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.25
	case globals.LLaMa213B, globals.CodeLLaMa13B, globals.LLaMa27B, globals.CodeLLaMa7B:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.1
	case globals.ZhiPuChatGLMPro:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.1
	case globals.ZhiPuChatGLMTurbo, globals.ZhiPuChatGLMStd:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.05
	case globals.QwenTurbo, globals.QwenTurboNet:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.08
	case globals.QwenPlus, globals.QwenPlusNet:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.2
	default:
		return 0
	}
}

func CountOutputToken(model string, t int) float32 {
	switch model {
	case globals.GPT3Turbo, globals.GPT3Turbo0613, globals.GPT3Turbo0301, globals.GPT3TurboInstruct, globals.GPT3Turbo1106,
		globals.GPT3Turbo16k, globals.GPT3Turbo16k0613, globals.GPT3Turbo16k0301:
		return 0
	case globals.GPT41106Preview:
		return float32(t*GetWeightByModel(model)) / 1000 * 2.1 * 0.6
	case globals.GPT4, globals.GPT4Vision, globals.GPT4All, globals.GPT4Dalle, globals.GPT40314, globals.GPT40613:
		return float32(t*GetWeightByModel(model)) / 1000 * 4.3 * 0.6
	case globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314:
		return float32(t*GetWeightByModel(model)) / 1000 * 8.6
	case globals.SparkDesk:
		return 0 // float32(t*GetWeightByModel(model)) / 1000 * 0.15 free now
	case globals.SparkDeskV2, globals.SparkDeskV3:
		return 0 // float32(t*GetWeightByModel(model)) / 1000 * 0.3 free now
	case globals.Claude1, globals.Claude2:
		return 0
	case globals.Claude1100k, globals.Claude2100k:
		return float32(t*GetWeightByModel(model)) / 1000 * 2.4 * 0.6
	case globals.LLaMa270B, globals.CodeLLaMa34B:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.25
	case globals.LLaMa213B, globals.CodeLLaMa13B, globals.LLaMa27B, globals.CodeLLaMa7B:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.1
	case globals.ZhiPuChatGLMPro:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.1
	case globals.ZhiPuChatGLMTurbo, globals.ZhiPuChatGLMStd:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.05
	case globals.QwenTurbo, globals.QwenTurboNet:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.08
	case globals.QwenPlus, globals.QwenPlusNet:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.2
	case globals.StableDiffusion:
		return 0.25
	case globals.Midjourney:
		return 0.5
	default:
		return 0
	}
}
