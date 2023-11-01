package chatgpt

import (
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
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

func (c *ChatInstance) ProcessLine(instruct bool, buf, data string) (string, error) {
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
			return c.ProcessLine(instruct, "", buf+item)
		}

		if err := processChatErrorResponse(item); err == nil {
			globals.Warn(fmt.Sprintf("chatgpt error: cannot parse response: %s", item))
			return data, errors.New("parser error: cannot parse response")
		} else {
			return "", fmt.Errorf("chatgpt error: %s (type: %s)", err.Data.Error.Message, err.Data.Error.Type)
		}

	} else {
		return getChoices(form), nil
	}
}
