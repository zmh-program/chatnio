package palm2

import (
	"chat/globals"
	"chat/utils"
	"fmt"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
}

func (c *ChatInstance) GetChatEndpoint(model string) string {
	return fmt.Sprintf("%s/v1beta2/models/%s:generateMessage?key=%s", c.Endpoint, model, c.ApiKey)
}

func (c *ChatInstance) ConvertMessage(message []globals.Message) []PalmMessage {
	var result []PalmMessage
	for i, item := range message {
		if len(item.Content) == 0 {
			// palm model: message must include non empty content
			continue
		}

		if item.Role == globals.Tool {
			continue
		}

		if i > 0 && item.Role == result[len(result)-1].Author {
			// palm model: messages must alternate between authors
			result[len(result)-1].Content += " " + item.Content
			continue
		}

		result = append(result, PalmMessage{
			Author:  item.Role,
			Content: item.Content,
		})
	}
	return result
}

func (c *ChatInstance) GetChatBody(props *ChatProps) *ChatBody {
	return &ChatBody{
		Prompt: Prompt{
			Messages: c.ConvertMessage(props.Message),
		},
	}
}

func (c *ChatInstance) CreateChatRequest(props *ChatProps) (string, error) {
	uri := c.GetChatEndpoint(props.Model)
	data, err := utils.Post(uri, map[string]string{
		"Content-Type": "application/json",
	}, c.GetChatBody(props))

	if err != nil {
		return "", fmt.Errorf("palm2 error: %s", err.Error())
	}

	if form := utils.MapToStruct[ChatResponse](data); form != nil {
		if len(form.Candidates) == 0 {
			return "I don't know how to respond to that. Please try another question.", nil
		}
		return form.Candidates[0].Content, nil
	}
	return "", fmt.Errorf("palm2 error: cannot parse response")
}

// CreateStreamChatRequest is the mock stream request for palm2
// tips: palm2 does not support stream request
func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	response, err := c.CreateChatRequest(props)
	if err != nil {
		return err
	}

	for _, item := range utils.SplitItem(response, " ") {
		if err := callback(item); err != nil {
			return err
		}
	}
	return nil
}
