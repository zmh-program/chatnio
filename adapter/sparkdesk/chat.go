package sparkdesk

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Model       string
	Message     []globals.Message
	Token       *int
	Temperature *float32
	TopK        *int
	Tools       *globals.FunctionTools
	Buffer      utils.Buffer
}

func GetToken(props *ChatProps) *int {
	if props.Token == nil {
		return nil
	}

	switch props.Model {
	case globals.SparkDeskV2, globals.SparkDeskV3:
		if *props.Token > 8192 {
			return utils.ToPtr(8192)
		}
	case globals.SparkDesk:
		if *props.Token > 4096 {
			return utils.ToPtr(4096)
		}
	}

	return props.Token
}

func (c *ChatInstance) GetMessages(props *ChatProps) []Message {
	var messages []Message
	for _, message := range props.Message {
		if message.Role == globals.Tool {
			continue
		}
		if message.Role == globals.System {
			message.Role = globals.Assistant
		}
		messages = append(messages, Message{
			Role:    message.Role,
			Content: message.Content,
		})
	}

	return messages
}

func (c *ChatInstance) GetFunctionCalling(props *ChatProps) *FunctionsPayload {
	if props.Model != globals.SparkDeskV3 || props.Tools == nil {
		return nil
	}

	return &FunctionsPayload{
		Text: utils.Each[globals.ToolObject, globals.ToolFunction](*props.Tools,
			func(tool globals.ToolObject) globals.ToolFunction {
				return tool.Function
			}),
	}
}

func getChoice(form *ChatResponse) *globals.Chunk {
	if len(form.Payload.Choices.Text) == 0 {
		return &globals.Chunk{Content: ""}
	}

	choice := form.Payload.Choices.Text[0]

	return &globals.Chunk{
		Content: choice.Content,
		ToolCall: utils.Multi(choice.FunctionCall != nil, &globals.ToolCalls{
			globals.ToolCall{
				Type: "function",
				Id:   globals.ToolCallId(fmt.Sprintf("%s-%s", choice.FunctionCall.Name, choice.FunctionCall.Arguments)),
				Function: globals.ToolCallFunction{
					Name:      choice.FunctionCall.Name,
					Arguments: choice.FunctionCall.Arguments,
				},
			},
		}, nil),
	}
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocketClient(c.GenerateUrl()); conn == nil {
		return fmt.Errorf("sparkdesk error: websocket connection failed")
	}
	defer conn.DeferClose()

	if err := conn.SendJSON(&ChatRequest{
		Header: RequestHeader{
			AppId: c.AppId,
		},
		Payload: RequestPayload{
			Message: MessagePayload{
				Text: c.GetMessages(props),
			},
			Functions: c.GetFunctionCalling(props),
		},
		Parameter: RequestParameter{
			Chat: ChatParameter{
				Domain:   c.Model,
				MaxToken: GetToken(props),
			},
		},
	}); err != nil {
		return err
	}

	for {
		form, err := utils.ReadForm[ChatResponse](conn)
		if err != nil {
			if strings.Contains(err.Error(), "websocket: close 1000") {
				return nil
			}
			globals.Debug(fmt.Sprintf("sparkdesk error: %s", err.Error()))
			return nil
		}

		if form.Header.Code != 0 {
			return fmt.Errorf("sparkdesk error: %s (sid: %s)", form.Header.Message, form.Header.Sid)
		}

		if err := hook(getChoice(form)); err != nil {
			return err
		}
	}
}
