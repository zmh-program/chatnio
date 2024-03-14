package midjourney

import (
	"chat/globals"
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

func (c *ChatInstance) CreateImagineRequest(proxy globals.ProxyConfig, prompt string) (*CommonResponse, error) {
	content, err := utils.PostRaw(
		c.GetImagineEndpoint(),
		c.GetMidjourneyHeaders(),
		c.GetImagineRequest(prompt),
		proxy,
	)

	if err != nil {
		return nil, err
	}

	if data, err := utils.UnmarshalString[CommonResponse](content); err == nil {
		return &data, nil
	} else {
		return nil, utils.ToMarkdownError(err, content)
	}
}

func (c *ChatInstance) CreateChangeRequest(proxy globals.ProxyConfig, action string, task string, index *int) (*CommonResponse, error) {
	res, err := utils.Post(
		c.GetChangeEndpoint(),
		c.GetMidjourneyHeaders(),
		c.GetChangeRequest(action, task, index),
		proxy,
	)

	if err != nil {
		return nil, err
	}

	return utils.MapToStruct[CommonResponse](res), nil
}
