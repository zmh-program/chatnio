package midjourney

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

const maxActions = 4
const (
	ImagineAction   = "IMAGINE"
	UpscaleAction   = "UPSCALE"
	VariationAction = "VARIATION"
	RerollAction    = "REROLL"
)

const (
	ImagineCommand   = "/IMAGINE"
	UpscaleCommand   = "/UPSCALE"
	VariationCommand = "/VARIATION"
	RerollCommand    = "/REROLL"
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

func (c *ChatInstance) IsIgnoreMode() bool {
	return strings.HasSuffix(c.Endpoint, "/mj-relax") ||
		strings.HasSuffix(c.Endpoint, "/mj-fast") ||
		strings.HasSuffix(c.Endpoint, "/mj-turbo")
}

func (c *ChatInstance) GetCleanPrompt(model string, prompt string) string {
	if c.IsIgnoreMode() {
		return prompt
	}

	arr := strings.Split(strings.TrimSpace(prompt), " ")
	var res []string

	for _, word := range arr {
		if utils.Contains[string](word, RendererMode) {
			continue
		}
		res = append(res, word)
	}

	res = append(res, getMode(model))
	target := strings.Join(res, " ")
	return target
}

func (c *ChatInstance) GetPrompt(props *adaptercommon.ChatProps) string {
	if len(props.Message) == 0 {
		return ""
	}

	content := props.Message[len(props.Message)-1].Content
	return c.GetCleanPrompt(props.Model, content)
}

func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
	// partial response like:
	// ```progress
	// 0
	// ...
	// 100
	// ```
	// ![image](...)

	if len(globals.NotifyUrl) == 0 {
		return fmt.Errorf("format error: please provide available notify url")
	}
	action, prompt := c.ExtractPrompt(c.GetPrompt(props))
	if len(prompt) == 0 {
		return fmt.Errorf("format error: please provide available prompt")
	}

	var begin bool

	form, err := c.CreateStreamTask(props, action, prompt, func(form *StorageForm, progress int) error {
		if progress == -1 {
			// ping event
			return callback(&globals.Chunk{Content: ""})
		}

		if !begin {
			begin = true
			if err := callback(&globals.Chunk{Content: "```progress\n"}); err != nil {
				return err
			}
		} else if progress == 100 && !begin {
			if err := callback(&globals.Chunk{Content: "```progress\n"}); err != nil {
				return err
			}
		}

		if err := callback(&globals.Chunk{Content: fmt.Sprintf("%d\n", progress)}); err != nil {
			return err
		}

		if progress == 100 {
			if err := callback(&globals.Chunk{Content: "```\n"}); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("error from midjourney: %s", err.Error())
	}

	if err := callback(&globals.Chunk{Content: utils.GetImageMarkdown(form.Url)}); err != nil {
		return err
	}

	return c.CallbackActions(props, form, callback)
}

func toVirtualMessage(message string, model string) string {
	prompt := strings.Replace(message, " ", "-", -1)
	return fmt.Sprintf("https://chatnio.virtual%s::%s", prompt, model)
}

func (c *ChatInstance) CallbackActions(props *adaptercommon.ChatProps, form *StorageForm, callback globals.Hook) error {
	if form.Action == UpscaleAction {
		return nil
	}

	actions := utils.Range(1, maxActions+1)

	upscale := strings.Join(utils.Each(actions, func(index int) string {
		return fmt.Sprintf("[U%d](%s)", index, toVirtualMessage(fmt.Sprintf("/UPSCALE %s %d", form.Task, index), props.OriginalModel))
	}), " ")

	variation := strings.Join(utils.Each(actions, func(index int) string {
		return fmt.Sprintf("[V%d](%s)", index, toVirtualMessage(fmt.Sprintf("/VARIATION %s %d", form.Task, index), props.OriginalModel))
	}), " ")

	reroll := fmt.Sprintf("[REROLL](%s)", toVirtualMessage(fmt.Sprintf("/REROLL %s", form.Task), props.OriginalModel))

	return callback(&globals.Chunk{
		Content: fmt.Sprintf("\n\n%s\n\n%s\n\n%s\n", upscale, variation, reroll),
	})
}
