package openai

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ImageProps struct {
	Model  string
	Prompt string
	Size   ImageSize
	Proxy  globals.ProxyConfig
}

func (c *ChatInstance) GetImageEndpoint() string {
	return fmt.Sprintf("%s/v1/images/generations", c.GetEndpoint())
}

// CreateImageRequest will create a dalle image from prompt, return url of image and error
func (c *ChatInstance) CreateImageRequest(props ImageProps) (string, error) {
	res, err := utils.Post(
		c.GetImageEndpoint(),
		c.GetHeader(), ImageRequest{
			Model:  props.Model,
			Prompt: props.Prompt,
			Size: utils.Multi[ImageSize](
				props.Model == globals.Dalle3,
				ImageSize1024,
				ImageSize512,
			),
			N: 1,
		}, props.Proxy)
	if err != nil || res == nil {
		return "", fmt.Errorf(err.Error())
	}

	data := utils.MapToStruct[ImageResponse](res)
	if data == nil {
		return "", fmt.Errorf("openai error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf(data.Error.Message)
	}

	return data.Data[0].Url, nil
}

// CreateImage will create a dalle image from prompt, return markdown of image
func (c *ChatInstance) CreateImage(props *adaptercommon.ChatProps) (string, error) {
	original, err := c.CreateImageRequest(ImageProps{
		Model:  props.Model,
		Prompt: c.GetLatestPrompt(props),
		Proxy:  props.Proxy,
	})
	if err != nil {
		if strings.Contains(err.Error(), "safety") {
			return err.Error(), nil
		}
		return "", err
	}

	url := utils.StoreImage(original)
	return utils.GetImageMarkdown(url), nil
}
