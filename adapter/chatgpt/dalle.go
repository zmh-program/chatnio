package chatgpt

import (
	"chat/utils"
	"fmt"
)

type ImageProps struct {
	Prompt string
	Size   ImageSize
}

func (c *ChatInstance) GetImageEndpoint() string {
	return fmt.Sprintf("%s/v1/images/generations", c.GetEndpoint())
}

// CreateImage will create a dalle image from prompt, return url of image and error
func (c *ChatInstance) CreateImage(props ImageProps) (string, error) {
	res, err := utils.Post(
		c.GetImageEndpoint(),
		c.GetHeader(), ImageRequest{
			Prompt: props.Prompt,
			Size:   utils.Multi[ImageSize](len(props.Size) == 0, ImageSize512, props.Size),
			N:      1,
		})
	if err != nil || res == nil {
		return "", fmt.Errorf("chatgpt error: %s", err.Error())
	}

	data := utils.MapToStruct[ImageResponse](res)
	if data == nil {
		return "", fmt.Errorf("chatgpt error: cannot parse response")
	} else if data.Error.Message != "" {
		return "", fmt.Errorf("chatgpt error: %s", data.Error.Message)
	}

	return data.Data[0].Url, nil
}
