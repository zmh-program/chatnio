package skylark

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/volcengine/volc-sdk-golang/service/maas"
	"github.com/volcengine/volc-sdk-golang/service/maas/models/api"
)

type ChatProps struct {
	Model   string
	Message []globals.Message
	Token   int

	PresencePenalty  *float32
	FrequencyPenalty *float32
	RepeatPenalty    *float32
	Temperature      *float32
	TopP             *float32
	TopK             *int
	Tools            *globals.FunctionTools
	Buffer           utils.Buffer
}

func getMessages(messages []globals.Message) []*api.Message {
	return utils.Each[globals.Message, *api.Message](messages, func(message globals.Message) *api.Message {
		if message.Role == globals.Tool {
			message.Role = maas.ChatRoleOfFunction
		}

		return &api.Message{
			Role:         message.Role,
			Content:      message.Content,
			FunctionCall: getFunctionCall(message.ToolCalls),
		}
	})
}

func (c *ChatInstance) CreateRequest(props *ChatProps) *api.ChatReq {
	return &api.ChatReq{
		Model: &api.Model{
			Name: props.Model,
		},
		Messages: getMessages(props.Message),
		Parameters: &api.Parameters{
			TopP:              utils.GetPtrVal(props.TopP, 0.),
			TopK:              int64(utils.GetPtrVal(props.TopK, 0)),
			Temperature:       utils.GetPtrVal(props.Temperature, 0.),
			PresencePenalty:   utils.GetPtrVal(props.PresencePenalty, 0.),
			FrequencyPenalty:  utils.GetPtrVal(props.FrequencyPenalty, 0.),
			RepetitionPenalty: utils.GetPtrVal(props.RepeatPenalty, 0.),
			MaxTokens:         int64(props.Token),
		},
		Functions: getFunctions(props.Tools),
	}
}

func getChoice(choice *api.ChatResp, buffer utils.Buffer) string {
	if choice == nil {
		return ""
	}

	calls := choice.Choice.Message.FunctionCall
	if calls != nil {
		buffer.SetToolCalls(&globals.ToolCalls{
			globals.ToolCall{
				Type: "function",
				Id:   globals.ToolCallId(fmt.Sprintf("%s-%s", calls.Name, choice.ReqId)),
				Function: globals.ToolCallFunction{
					Name:      calls.Name,
					Arguments: calls.Arguments,
				},
			},
		})
	}
	return choice.Choice.Message.Content
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	req := c.CreateRequest(props)
	channel, err := c.Instance.StreamChat(req)
	if err != nil {
		return err
	}

	for partial := range channel {
		if partial.Error != nil {
			return partial.Error
		}

		if err := callback(getChoice(partial, props.Buffer)); err != nil {
			return err
		}
	}

	return nil
}
