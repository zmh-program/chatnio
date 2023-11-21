package sparkdesk

import (
	"chat/globals"
	"chat/utils"
	"fmt"
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

func getChoice(form *ChatResponse, buffer utils.Buffer) string {
	resp := form.Payload.Choices.Text
	if len(resp) == 0 {
		return ""
	}

	if resp[0].FunctionCall != nil {
		buffer.SetToolCalls(&globals.ToolCalls{
			globals.ToolCall{
				Type: "function",
				Id:   globals.ToolCallId(fmt.Sprintf("%s-%s", resp[0].FunctionCall.Name, resp[0].FunctionCall.Arguments)),
				Function: globals.ToolCallFunction{
					Name:      resp[0].FunctionCall.Name,
					Arguments: resp[0].FunctionCall.Arguments,
				},
			},
		})
	}

	return resp[0].Content
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
		form := utils.ReadForm[ChatResponse](conn)
		if form == nil {
			return nil
		}

		if form.Header.Code != 0 {
			return fmt.Errorf("sparkdesk error: %s (sid: %s)", form.Header.Message, form.Header.Sid)
		}

		if err := hook(getChoice(form, props.Buffer)); err != nil {
			return err
		}
	}
}
