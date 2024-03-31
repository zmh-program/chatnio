package skylark

import (
	adaptercommon "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"

	"github.com/volcengine/volc-sdk-golang/service/maas"
	"github.com/volcengine/volc-sdk-golang/service/maas/models/api"
)

const defaultMaxTokens int64 = 1500

func getMessages(messages []globals.Message) []*api.Message {
	result := make([]*api.Message, 0)

	for _, message := range messages {
		if message.Role == globals.Tool {
			message.Role = maas.ChatRoleOfFunction
		}

		msg := &api.Message{
			Role:         message.Role,
			Content:      message.Content,
			FunctionCall: getFunctionCall(message.ToolCalls),
		}

		hasPrevious := len(result) > 0

		//  a message should not followed by the same role message, merge them
		if hasPrevious && result[len(result)-1].Role == message.Role {
			prev := result[len(result)-1]
			prev.Content += msg.Content
			if message.ToolCalls != nil {
				prev.FunctionCall = msg.FunctionCall
			}

			continue
		}

		// `assistant` message should follow a user or function message, if not has previous message, change the role to `user`
		if !hasPrevious && message.Role == maas.ChatRoleOfAssistant {
			msg.Role = maas.ChatRoleOfUser
		}

		result = append(result, msg)
	}

	return result
}

func (c *ChatInstance) GetMaxTokens(token *int) int64 {
	if token == nil || *token < 0 {
		return defaultMaxTokens
	}

	return int64(*token)
}

func (c *ChatInstance) CreateRequest(props *adaptercommon.ChatProps) *api.ChatReq {
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
			RepetitionPenalty: utils.GetPtrVal(props.RepetitionPenalty, 0.),
			MaxTokens:         c.GetMaxTokens(props.MaxTokens),
		},
		Functions: getFunctions(props.Tools),
	}
}

func getToolCalls(choice *api.ChatResp) *globals.ToolCalls {
	calls := choice.Choice.Message.FunctionCall
	if calls == nil {
		return nil
	}

	return &globals.ToolCalls{
		globals.ToolCall{
			Type: "function",
			Id:   fmt.Sprintf("%s-%s", calls.Name, choice.ReqId),
			Function: globals.ToolCallFunction{
				Name:      calls.Name,
				Arguments: calls.Arguments,
			},
		},
	}
}

func getChoice(choice *api.ChatResp) *globals.Chunk {
	if choice == nil || choice.Choice == nil || choice.Choice.Message == nil {
		return &globals.Chunk{Content: ""}
	}

	message := choice.Choice.Message
	return &globals.Chunk{
		Content:  message.Content,
		ToolCall: getToolCalls(choice),
	}
}

func (c *ChatInstance) CreateStreamChatRequest(props *adaptercommon.ChatProps, callback globals.Hook) error {
	req := c.CreateRequest(props)
	channel, err := c.Instance.StreamChat(req)
	if err != nil {
		return err
	}

	for partial := range channel {
		if partial.Error != nil {
			return partial.Error
		}

		if err := callback(getChoice(partial)); err != nil {
			return err
		}
	}

	return nil
}
