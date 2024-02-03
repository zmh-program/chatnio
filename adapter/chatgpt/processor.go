package chatgpt

import (
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
	"regexp"
	"strings"
)

func formatMessages(props *ChatProps) interface{} {
	if props.Model == globals.GPT4Vision {
		base := props.Message[len(props.Message)-1].Content
		urls := utils.ExtractImageUrls(base)

		if len(urls) > 0 {
			base = fmt.Sprintf("%s %s", strings.Join(urls, " "), base)
		}
		props.Message[len(props.Message)-1].Content = base
		return props.Message
	} else if globals.IsOpenAIVisionModels(props.Model) {
		return utils.Each[globals.Message, Message](props.Message, func(message globals.Message) Message {
			if message.Role == globals.User {
				urls := utils.ExtractImageUrls(message.Content)
				images := utils.EachNotNil[string, MessageContent](urls, func(url string) *MessageContent {
					obj, err := utils.NewImage(url)
					if err != nil {
						return nil
					}

					props.Buffer.AddImage(obj)

					return &MessageContent{
						Type: "image_url",
						ImageUrl: &ImageUrl{
							Url: url,
						},
					}
				})

				return Message{
					Role: message.Role,
					Content: utils.Prepend(images, MessageContent{
						Type: "text",
						Text: &message.Content,
					}),
					ToolCalls:  message.ToolCalls,
					ToolCallId: message.ToolCallId,
				}
			}

			return Message{
				Role: message.Role,
				Content: MessageContents{
					MessageContent{
						Type: "text",
						Text: &message.Content,
					},
				},
				ToolCalls:  message.ToolCalls,
				ToolCallId: message.ToolCallId,
			}
		})
	}

	return props.Message
}

func processChatResponse(data string) *ChatStreamResponse {
	return utils.UnmarshalForm[ChatStreamResponse](data)
}

func processCompletionResponse(data string) *CompletionResponse {
	return utils.UnmarshalForm[CompletionResponse](data)
}

func processChatErrorResponse(data string) *ChatStreamErrorResponse {
	return utils.UnmarshalForm[ChatStreamErrorResponse](data)
}

func getChoices(form *ChatStreamResponse) string {
	if len(form.Choices) == 0 {
		return ""
	}

	return form.Choices[0].Delta.Content
}

func getCompletionChoices(form *CompletionResponse) string {
	if len(form.Choices) == 0 {
		return ""
	}

	return form.Choices[0].Text
}

func getToolCalls(form *ChatStreamResponse) *globals.ToolCalls {
	if len(form.Choices) == 0 {
		return nil
	}

	return form.Choices[0].Delta.ToolCalls
}

func getRobustnessResult(chunk string) string {
	exp := `\"content\":\"(.*?)\"`
	compile, err := regexp.Compile(exp)
	if err != nil {
		return ""
	}

	matches := compile.FindStringSubmatch(chunk)
	if len(matches) > 1 {
		return utils.ProcessRobustnessChar(matches[1])
	} else {
		return ""
	}
}

func (c *ChatInstance) ProcessLine(obj utils.Buffer, data string, isCompletionType bool) (string, error) {
	if isCompletionType {
		// legacy support
		if completion := processCompletionResponse(data); completion != nil {
			return getCompletionChoices(completion), nil
		}

		globals.Warn(fmt.Sprintf("chatgpt error: cannot parse completion response: %s", data))
		return "", errors.New("parser error: cannot parse completion response")
	}

	if form := processChatResponse(data); form != nil {
		obj.SetToolCalls(getToolCalls(form))
		return getChoices(form), nil
	}

	if form := processChatErrorResponse(data); form != nil {
		return "", errors.New(fmt.Sprintf("chatgpt error: %s (type: %s)", form.Error.Message, form.Error.Type))
	}

	globals.Warn(fmt.Sprintf("chatgpt error: cannot parse chat completion response: %s", data))
	return "", errors.New("parser error: cannot parse chat completion response")
}
