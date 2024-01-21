package midjourney

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

var midjourneyEmptySecret = "null"

func (c *ChatInstance) GetImagineUrl() string {
	return fmt.Sprintf("%s/mj/submit/imagine", c.GetEndpoint())
}

func (c *ChatInstance) GetImagineHeaders() map[string]string {
	secret := c.GetApiSecret()
	if secret == "" || secret == midjourneyEmptySecret {
		return map[string]string{
			"Content-Type": "application/json",
		}
	}

	return map[string]string{
		"Content-Type":  "application/json",
		"mj-api-secret": secret,
	}
}

func (c *ChatInstance) CreateImagineRequest(prompt string) (*ImagineResponse, error) {
	res, err := utils.Post(
		c.GetImagineUrl(),
		c.GetImagineHeaders(),
		ImagineRequest{
			NotifyHook: fmt.Sprintf(
				"%s/mj/notify",
				globals.NotifyUrl,
			),
			Prompt: prompt,
		},
	)

	if err != nil {
		return nil, err
	}

	return utils.MapToStruct[ImagineResponse](res), nil
}

func getStatusCode(response *ImagineResponse) error {
	code := response.Code
	switch code {
	case SuccessCode, QueueCode:
		return nil
	case ExistedCode:
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

func (c *ChatInstance) CreateStreamImagineTask(prompt string, hook func(progress int) error) (string, error) {
	res, err := c.CreateImagineRequest(prompt)
	if err != nil {
		return "", err
	}

	if err := getStatusCode(res); err != nil {
		return "", err
	}

	task := res.Result
	progress := -1

	for {
		utils.Sleep(100)
		form := getStorage(task)
		if form == nil {
			continue
		}

		switch form.Status {
		case Success:
			if err := hook(100); err != nil {
				return "", err
			}
			return form.Url, nil
		case Failure:
			if err := hook(100); err != nil {
				return "", err
			}
			return "", fmt.Errorf("task failed: %s", form.FailReason)
		case InProgress:
			current := getProgress(form.Progress)
			if progress != current {
				if err := hook(current); err != nil {
					return "", err
				}
				progress = current
			}
		}
	}
}

func (c *ChatInstance) CreateImagineTask(prompt string) (string, error) {
	return c.CreateStreamImagineTask(prompt, func(progress int) error {
		return nil
	})
}
