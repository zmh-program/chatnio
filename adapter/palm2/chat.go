package palm2

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
)

var geminiMaxImages = 16

func (c *ChatInstance) GetChatEndpoint(model string) string {
	if model == globals.ChatBison001 {
		return fmt.Sprintf("%s/v1beta2/models/%s:generateMessage?key=%s", c.Endpoint, model, c.ApiKey)
	}

	return fmt.Sprintf("%s/v1beta/models/%s:generateContent?key=%s", c.Endpoint, model, c.ApiKey)
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

func (c *ChatInstance) GetPalm2ChatBody(props *adaptercommon.ChatProps) *PalmChatBody {
	return &PalmChatBody{
		Prompt: PalmPrompt{
			Messages: c.ConvertMessage(props.Message),
		},
	}
}

func (c *ChatInstance) GetGeminiChatBody(props *adaptercommon.ChatProps) *GeminiChatBody {
	return &GeminiChatBody{
		Contents: c.GetGeminiContents(props.Model, props.Message),
		GenerationConfig: GeminiConfig{
			Temperature:     props.Temperature,
			MaxOutputTokens: props.MaxTokens,
			TopP:            props.TopP,
			TopK:            props.TopK,
		},
	}
}

func (c *ChatInstance) GetPalm2ChatResponse(data interface{}) (string, error) {
	if form := utils.MapToStruct[PalmChatResponse](data); form != nil {
		if len(form.Candidates) == 0 {
			return "", fmt.Errorf("palm2 error: the content violates content policy")
		}
		return form.Candidates[0].Content, nil
	}
	return "", fmt.Errorf("palm2 error: cannot parse response")
}

func (c *ChatInstance) GetGeminiChatResponse(data interface{}) (string, error) {
	if form := utils.MapToStruct[GeminiChatResponse](data); form != nil {
		if len(form.Candidates) != 0 && len(form.Candidates[0].Content.Parts) != 0 {
			return form.Candidates[0].Content.Parts[0].Text, nil
		}
	}

	if form := utils.MapToStruct[GeminiChatErrorResponse](data); form != nil {
		return "", fmt.Errorf("gemini error: %s (code: %d, status: %s)", form.Error.Message, form.Error.Code, form.Error.Status)
	}

	return "", fmt.Errorf("gemini: cannot parse response")
}

func (c *ChatInstance) CreateChatRequest(props *adaptercommon.ChatProps) (string, error) {
	uri := c.GetChatEndpoint(props.Model)

	if props.Model == globals.ChatBison001 {
		data, err := utils.Post(uri, map[string]string{
			"Content-Type": "application/json",
		}, c.GetPalm2ChatBody(props), props.Proxy)

		if err != nil {
			return "", fmt.Errorf("palm2 error: %s", err.Error())
		}
		return c.GetPalm2ChatResponse(data)
	}

	data, err := utils.Post(uri, map[string]string{
		"Content-Type": "application/json",
	}, c.GetGeminiChatBody(props), props.Proxy)

	if err != nil {
		return "", fmt.Errorf("gemini error: %s", err.Error())
	}

	return c.GetGeminiChatResponse(data)
}

// CreateStreamChatRequest is the mock stream request for palm2
// tips: palm2 does not support stream request
func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
	response, err := c.CreateChatRequest(props)
	if err != nil {
		return err
	}

	for _, item := range utils.SplitItem(response, " ") {
		if err := callback(&globals.Chunk{Content: item}); err != nil {
			return err
		}
	}
	return nil
}
