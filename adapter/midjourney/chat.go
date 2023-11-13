package midjourney

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Messages []globals.Message
	Model    string
}

func getMode(model string) string {
	switch model {
	case globals.Midjourney: // relax
		return RelaxMode
	case globals.MidjourneyFast: // fast
		return FastMode
	case globals.MidjourneyTurbo: // turbo
		return TurboMode
	default:
		return RelaxMode
	}
}

func (c *ChatInstance) GetCleanPrompt(model string, prompt string) string {
	arr := strings.Split(strings.TrimSpace(prompt), " ")
	var res []string

	for _, word := range arr {
		if utils.Contains[string](word, ModeArr) {
			continue
		}
		res = append(res, word)
	}

	res = append(res, getMode(model))
	target := strings.Join(res, " ")
	return target
}

func (c *ChatInstance) GetPrompt(props *ChatProps) string {
	return c.GetCleanPrompt(props.Model, props.Messages[len(props.Messages)-1].Content)
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	// partial response like:
	// ```progress
	// 0
	// ...
	// 100
	// ```
	// ![image](...)

	prompt := c.GetPrompt(props)
	if prompt == "" {
		return fmt.Errorf("format error: please provide available prompt")
	}

	if err := callback("```progress\n"); err != nil {
		return err
	}

	url, err := c.CreateStreamImagineTask(prompt, func(progress int) error {
		return callback(fmt.Sprintf("%d\n", progress))
	})

	if err := callback("```\n"); err != nil {
		return err
	}

	if err != nil {
		return fmt.Errorf("error from midjourney: %s", err.Error())
	}

	return callback(utils.GetImageMarkdown(url))
}
