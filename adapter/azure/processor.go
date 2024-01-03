package azure

import (
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
	"regexp"
	"strings"
)

func processFormat(data string) string {
	rep := strings.NewReplacer(
		"data: {",
		"\"data\": {",
	)
	item := rep.Replace(data)
	if !strings.HasPrefix(item, "{") {
		item = "{" + item
	}
	if !strings.HasSuffix(item, "}}") {
		item = item + "}"
	}

	return item
}

func formatMessages(props *ChatProps) interface{} {
	if props.Model == globals.GPT4Vision {
		base := props.Message[len(props.Message)-1].Content
		urls := utils.ExtractImageUrls(base)

		if len(urls) > 0 {
			base = fmt.Sprintf("%s %s", strings.Join(urls, " "), base)
		}
		props.Message[len(props.Message)-1].Content = base
		return props.Message
	} else if globals.IsGPT41106VisionPreview(props.Model) {
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
	if strings.HasPrefix(data, "{") {
		var form *ChatStreamResponse
		if form = utils.UnmarshalForm[ChatStreamResponse](data); form != nil {
			return form
		}

		if form = utils.UnmarshalForm[ChatStreamResponse](data[:len(data)-1]); form != nil {
			return form
		}
	}

	return nil
}

func processCompletionResponse(data string) *CompletionResponse {
	if strings.HasPrefix(data, "{") {
		var form *CompletionResponse
		if form = utils.UnmarshalForm[CompletionResponse](data); form != nil {
			return form
		}

		if form = utils.UnmarshalForm[CompletionResponse](data[:len(data)-1]); form != nil {
			return form
		}
	}

	return nil
}

func processChatErrorResponse(data string) *ChatStreamErrorResponse {
	if strings.HasPrefix(data, "{") {
		var form *ChatStreamErrorResponse
		if form = utils.UnmarshalForm[ChatStreamErrorResponse](data); form != nil {
			return form
		}
		if form = utils.UnmarshalForm[ChatStreamErrorResponse](data + "}"); form != nil {
			return form
		}
	}

	return nil
}

func isDone(data string) bool {
	return utils.Contains[string](data, []string{
		"{data: [DONE]}", "{data: [DONE]}}",
		"{[DONE]}", "{data:}", "{data:}}",
	})
}

func getChoices(form *ChatStreamResponse) string {
	if len(form.Data.Choices) == 0 {
		return ""
	}

	return form.Data.Choices[0].Delta.Content
}

func getCompletionChoices(form *CompletionResponse) string {
	if len(form.Data.Choices) == 0 {
		return ""
	}

	return form.Data.Choices[0].Text
}

func getToolCalls(form *ChatStreamResponse) *globals.ToolCalls {
	if len(form.Data.Choices) == 0 {
		return nil
	}

	return form.Data.Choices[0].Delta.ToolCalls
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

func (c *ChatInstance) ProcessLine(obj utils.Buffer, instruct bool, buf, data string) (string, error) {
	item := processFormat(buf + data)
	if isDone(item) {
		return "", nil
	}

	if form := processChatResponse(item); form == nil {
		if instruct {
			// legacy support
			if completion := processCompletionResponse(item); completion != nil {
				return getCompletionChoices(completion), nil
			}
		}

		// recursive call
		if len(buf) > 0 {
			return c.ProcessLine(obj, instruct, "", buf+item)
		}

		if err := processChatErrorResponse(item); err == nil || err.Data.Error.Message == "" {
			if res := getRobustnessResult(item); res != "" {
				return res, nil
			}

			globals.Warn(fmt.Sprintf("chatgpt error: cannot parse response: %s", item))
			return data, errors.New("parser error: cannot parse response")
		} else {
			return "", fmt.Errorf("chatgpt error: %s (type: %s)", err.Data.Error.Message, err.Data.Error.Type)
		}

	} else {
		obj.SetToolCalls(getToolCalls(form))
		return getChoices(form), nil
	}
}
