package midjourney

import (
	"chat/utils"
	"fmt"
)

func (c *ChatInstance) GetImagineEndpoint() string {
	return fmt.Sprintf("%s/mj/submit/imagine", c.GetEndpoint())
}

func (c *ChatInstance) GetChangeEndpoint() string {
	return fmt.Sprintf("%s/mj/submit/change", c.GetEndpoint())
}

func (c *ChatInstance) GetImagineRequest(prompt string) *ImagineRequest {
	return &ImagineRequest{
		NotifyHook: c.GetNotifyEndpoint(),
		Prompt:     prompt,
	}
}

func (c *ChatInstance) GetChangeRequest(action string, task string, index *int) *ChangeRequest {
	return &ChangeRequest{
		NotifyHook: c.GetNotifyEndpoint(),
		Action:     action,
		Index:      index,
		TaskId:     task,
	}
}

func (c *ChatInstance) CreateImagineRequest(prompt string) (*CommonResponse, error) {
	res, err := utils.Post(
		c.GetImagineEndpoint(),
		c.GetMidjourneyHeaders(),
		c.GetImagineRequest(prompt),
	)

	if err != nil {
		return nil, err
	}

	return utils.MapToStruct[CommonResponse](res), nil
}

func (c *ChatInstance) CreateChangeRequest(action string, task string, index *int) (*CommonResponse, error) {
	res, err := utils.Post(
		c.GetChangeEndpoint(),
		c.GetMidjourneyHeaders(),
		c.GetChangeRequest(action, task, index),
	)

	if err != nil {
		return nil, err
	}

	fmt.Println(res)
	return utils.MapToStruct[CommonResponse](res), nil
}
