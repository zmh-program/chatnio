package midjourney

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"
)

const maxTimeout = 30 * time.Minute // 30 min timeout

func getStatusCode(action string, response *CommonResponse) error {
	code := response.Code
	switch code {
	case SuccessCode, QueueCode:
		return nil
	case ExistedCode:
		if action != ImagineCommand {
			return nil
		}
		return fmt.Errorf("task is existed, please try again later with another prompt")
	case MaxQueueCode:
		return fmt.Errorf("task queue is full, please try again later")
	case NudeCode:
		return fmt.Errorf("prompt violates the content policy of midjourney, the request is rejected")
	default:
		return fmt.Errorf(fmt.Sprintf("unknown error from midjourney (code: %d, description: %s)", code, response.Description))
	}
}

func getProgress(value string) int {
	progress := strings.TrimSuffix(value, "%")
	return utils.ParseInt(progress)
}

func (c *ChatInstance) GetAction(command string) string {
	return strings.TrimLeft(command, "/")
}

func (c *ChatInstance) ExtractPrompt(input string) (action string, prompt string) {
	segment := utils.SafeSplit(input, " ", 2)

	action = strings.TrimSpace(segment[0])
	prompt = strings.TrimSpace(segment[1])

	switch action {
	case ImagineCommand, VariationCommand, UpscaleCommand, RerollCommand:
		return
	default:
		return ImagineCommand, strings.TrimSpace(input)
	}
}

func (c *ChatInstance) ExtractCommand(input string) (task string, index *int) {
	segment := utils.SafeSplit(input, " ", 2)

	task = strings.TrimSpace(segment[0])

	if segment[1] != "" {
		data := segment[1]
		slice := strings.Split(segment[1], " ")
		if len(slice) > 1 {
			data = slice[0]
		}

		index = utils.ToPtr(utils.ParseInt(strings.TrimSpace(data)))
	}

	return
}

func (c *ChatInstance) CreateRequest(proxy globals.ProxyConfig, action string, prompt string) (*CommonResponse, error) {
	switch action {
	case ImagineCommand:
		return c.CreateImagineRequest(proxy, prompt)
	case VariationCommand, UpscaleCommand, RerollCommand:
		task, index := c.ExtractCommand(prompt)

		return c.CreateChangeRequest(proxy, c.GetAction(action), task, index)
	default:
		return nil, fmt.Errorf("unknown action: %s", action)
	}
}

func (c *ChatInstance) CreateStreamTask(props *adaptercommon.ChatProps, action string, prompt string, hook func(form *StorageForm, progress int) error) (*StorageForm, error) {
	res, err := c.CreateRequest(props.Proxy, action, prompt)
	if err != nil {
		return nil, err
	}

	if err := getStatusCode(action, res); err != nil {
		return nil, err
	}

	task := res.Result
	progress := -1

	ticker := time.NewTicker(50 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			form := getNotifyStorage(task)
			if form == nil {
				// hook for ping (in order to catch the stop signal)
				if err := hook(nil, -1); err != nil {
					return nil, err
				}
				continue
			}

			switch form.Status {
			case Success:
				if err := hook(form, 100); err != nil {
					return nil, err
				}
				return form, nil
			case Failure:
				return nil, fmt.Errorf("task failed: %s", form.FailReason)
			case InProgress:
				current := getProgress(form.Progress)
				if progress != current {
					if err := hook(form, current); err != nil {
						return nil, err
					}
					progress = current
				}
			default:
				// ping
				if err := hook(form, -1); err != nil {
					return nil, err
				}
			}
		case <-time.After(maxTimeout):
			return nil, fmt.Errorf("task timeout")
		}
	}
}