package utils

import (
	"chat/globals"
	"fmt"
	"github.com/pkoukk/tiktoken-go"
	"strings"
)

//   Using https://github.com/pkoukk/tiktoken-go
//   To count number of tokens of openai chat messages
//   OpenAI Cookbook: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb

//   Price Calculation
//   10 nio points = ¥1
//   from 2023-9-6, 1 USD = 7.3124 CNY
//
//   GPT-4 price (8k-context)
//   Input					Output
//   $0.03 	/ 1K tokens		$0.06 	/ 1K tokens
//   ￥0.21 	/ 1K tokens		￥0.43 	/ 1K tokens
//   2.1 nio 	/ 1K tokens		4.3 nio / 1K tokens
//
//   GPT-4 price (32k-context)
//   Input					Output
//   $0.06 	/ 1K tokens		$0.12 	/ 1K tokens
//   ￥0.43 	/ 1K tokens		￥0.86 	/ 1K tokens
//   4.3 nio 	/ 1K tokens		8.6 nio / 1K tokens

//   Dalle price (512x512)
//   $0.018 / per image
//   ￥0.13 / per image
//   1 nio / per image

func GetWeightByModel(model string) int {
	switch model {
	case globals.Claude2,
		globals.Claude2100k:
		return 2
	case globals.GPT432k,
		globals.GPT432k0613,
		globals.GPT432k0314:
		return 3 * 10
	case globals.GPT3Turbo,
		globals.GPT3Turbo0613,

		globals.GPT3Turbo16k,
		globals.GPT3Turbo16k0613,

		globals.GPT4,
		globals.GPT40314,
		globals.GPT40613,
		globals.SparkDesk:
		return 3
	case globals.GPT3Turbo0301, globals.GPT3Turbo16k0301:
		return 4 // every message follows <|start|>{role/name}\n{content}<|end|>\n
	default:
		if strings.Contains(model, globals.GPT3Turbo) {
			// warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.
			return GetWeightByModel(globals.GPT3Turbo0613)
		} else if strings.Contains(model, globals.GPT4) {
			// warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.
			return GetWeightByModel(globals.GPT40613)
		} else if strings.Contains(model, globals.Claude2) {
			// warning: claude-2 may update over time. Returning num tokens assuming claude-2-100k.
			return GetWeightByModel(globals.Claude2100k)
		} else {
			// not implemented: See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens
			panic(fmt.Errorf("not implemented for model %s", model))
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
	case globals.GPT3Turbo:
		return 0
	case globals.GPT3Turbo16k:
		return 0
	case globals.GPT4:
		return float32(CountTokenPrice(v, model)) / 1000 * 2.1
	case globals.GPT432k:
		return float32(CountTokenPrice(v, model)) / 1000 * 4.2
	case globals.SparkDesk:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.36
	case globals.Claude2:
		return 0
	case globals.Claude2100k:
		return float32(CountTokenPrice(v, model)) / 1000 * 0.008
	default:
		return 0
	}
}

func CountOutputToken(model string, t int) float32 {
	switch model {
	case globals.GPT3Turbo:
		return 0
	case globals.GPT3Turbo16k:
		return 0
	case globals.GPT4:
		return float32(t*GetWeightByModel(model)) / 1000 * 4.3
	case globals.GPT432k:
		return float32(t*GetWeightByModel(model)) / 1000 * 8.6
	case globals.SparkDesk:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.36
	case globals.Claude2:
		return 0
	case globals.Claude2100k:
		return float32(t*GetWeightByModel(model)) / 1000 * 0.008
	default:
		return 0
	}
}
