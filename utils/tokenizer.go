package utils

import (
	"chat/types"
	"fmt"
	"github.com/pkoukk/tiktoken-go"
	"strings"
)

// Using https://github.com/pkoukk/tiktoken-go
// To count number of tokens of openai chat messages
// OpenAI Cookbook: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb

func GetWeightByModel(model string) int {
	switch model {
	case types.Claude2,
		types.Claude2100k:
		return 2
	case types.GPT432k,
		types.GPT432k0613,
		types.GPT432k0314:
		return 3 * 10
	case types.GPT3Turbo,
		types.GPT3Turbo0613,

		types.GPT3Turbo16k,
		types.GPT3Turbo16k0613,

		types.GPT4,
		types.GPT40314,
		types.GPT40613:
		return 3
	case types.GPT3Turbo0301, types.GPT3Turbo16k0301:
		return 4 // every message follows <|start|>{role/name}\n{content}<|end|>\n
	default:
		if strings.Contains(model, types.GPT3Turbo) {
			// warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.
			return GetWeightByModel(types.GPT3Turbo0613)
		} else if strings.Contains(model, types.GPT4) {
			// warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.
			return GetWeightByModel(types.GPT40613)
		} else if strings.Contains(model, types.Claude2) {
			// warning: claude-2 may update over time. Returning num tokens assuming claude-2-100k.
			return GetWeightByModel(types.Claude2100k)
		} else {
			// not implemented: See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens
			panic(fmt.Errorf("not implemented for model %s", model))
		}
	}
}
func NumTokensFromMessages(messages []types.ChatGPTMessage, model string) (tokens int) {
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

func CountTokenPrice(messages []types.ChatGPTMessage, model string) int {
	return NumTokensFromMessages(messages, model)
}
