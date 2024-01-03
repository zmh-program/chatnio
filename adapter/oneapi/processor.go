package oneapi

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

func formatMessages(props *ChatProps) []globals.Message {
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

func (c *ChatInstance) ProcessLine(obj utils.Buffer, buf, data string) (string, error) {
	item := processFormat(buf + data)
	if isDone(item) {
		return "", nil
	}

	if form := processChatResponse(item); form == nil {
		// recursive call
		if len(buf) > 0 {
			return c.ProcessLine(obj, "", buf+item)
		}

		if err := processChatErrorResponse(item); err == nil {
			if res := getRobustnessResult(item); res != "" {
				return res, nil
			}

			globals.Warn(fmt.Sprintf("oneapi error: cannot parse response: %s", item))
			return data, errors.New("parser error: cannot parse response")
		} else {
			return "", fmt.Errorf("oneapi error: %s (type: %s)", err.Data.Error.Message, err.Data.Error.Type)
		}

	} else {
		obj.SetToolCalls(getToolCalls(form))
		return getChoices(form), nil
	}
}
