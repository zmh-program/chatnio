package sparkdesk

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

var FunctionCallingModels = []string{
	globals.SparkDeskV3,
	globals.SparkDeskV35,
}

func GetToken(props *adaptercommon.ChatProps) *int {
	if props.MaxTokens == nil {
		return nil
	}

	switch props.Model {
	case globals.SparkDeskV2, globals.SparkDeskV3, globals.SparkDeskV35:
		if *props.MaxTokens > 8192 {
			return utils.ToPtr(8192)
		}
	case globals.SparkDesk:
		if *props.MaxTokens > 4096 {
			return utils.ToPtr(4096)
		}
	}

	return props.MaxTokens
}

func (c *ChatInstance) GetMessages(props *adaptercommon.ChatProps) []Message {
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

func (c *ChatInstance) GetFunctionCalling(props *adaptercommon.ChatProps) *FunctionsPayload {
	if props.Tools == nil {
		return nil
	}

	if !utils.Contains(props.Model, FunctionCallingModels) {
		return nil
	}

	return &FunctionsPayload{
		Text: utils.Each[globals.ToolObject, globals.ToolFunction](*props.Tools,
			func(tool globals.ToolObject) globals.ToolFunction {
				return tool.Function
			}),
	}
}

func getFunctionCall(call *FunctionCall) *globals.ToolCalls {
	if call == nil {
		return nil
	}

	return &globals.ToolCalls{
		globals.ToolCall{
			Type: "function",
			Id:   fmt.Sprintf("%s-%s", call.Name, call.Arguments),
			Function: globals.ToolCallFunction{
				Name:      call.Name,
				Arguments: call.Arguments,
			},
		},
	}
}

func getChoice(form *ChatResponse) *globals.Chunk {
	if form == nil || len(form.Payload.Choices.Text) == 0 {
		return &globals.Chunk{Content: ""}
	}

	choices := form.Payload.Choices.Text
	if len(choices) == 0 {
		return &globals.Chunk{Content: ""}
	}

	choice := choices[0]

	return &globals.Chunk{
		Content:  choice.Content,
		ToolCall: getFunctionCall(choice.FunctionCall),
	}
}

func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, hook globals.Hook) error {
	endpoint := fmt.Sprintf("%s/%s/chat", c.Endpoint, TransformAddr(props.Model))

	var conn *utils.WebSocket
	if conn = utils.NewWebsocketClient(c.GenerateUrl(endpoint)); conn == nil {
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
				Domain:   TransformModel(props.Model),
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
