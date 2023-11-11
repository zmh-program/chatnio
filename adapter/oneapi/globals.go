package oneapi

import (
	"chat/globals"
)

var HitModels = []string{
	globals.Claude1, globals.Claude1100k,
	globals.Claude2, globals.Claude2100k,
	globals.StableDiffusion,
	globals.LLaMa270B, globals.LLaMa213B, globals.LLaMa27B,
	globals.CodeLLaMa34B, globals.CodeLLaMa13B, globals.CodeLLaMa7B,
}

func (c *ChatInstance) Process(data string) string {
	return data
}

func (c *ChatInstance) FormatMessage(message []globals.Message) []globals.Message {
	return message
}

func (c *ChatInstance) FormatModel(model string) string {
	return model
}

func (c *ChatInstance) GetToken(model string) int {
	switch model {
	case globals.Claude1, globals.Claude2:
		return 5000
	case globals.Claude2100k, globals.Claude1100k:
		return 50000
	case globals.LLaMa270B, globals.LLaMa213B, globals.LLaMa27B, globals.CodeLLaMa34B, globals.CodeLLaMa13B, globals.CodeLLaMa7B:
		return 3000
	default:
		return 2500
	}
}
