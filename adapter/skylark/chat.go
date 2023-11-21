package skylark

import (
	"chat/globals"
	"chat/utils"
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
			TopP:              utils.Multi(props.TopP == nil, 0., *props.TopP),
			TopK:              utils.Multi(props.TopK == nil, 0, int64(*props.TopK)),
			Temperature:       utils.Multi(props.Temperature == nil, 0., *props.Temperature),
			PresencePenalty:   utils.Multi(props.PresencePenalty == nil, 0., *props.PresencePenalty),
			FrequencyPenalty:  utils.Multi(props.FrequencyPenalty == nil, 0., *props.FrequencyPenalty),
			RepetitionPenalty: utils.Multi(props.RepeatPenalty == nil, 0., *props.RepeatPenalty),
			MaxTokens:         int64(props.Token),
		},
		Functions: getFunctions(props.Tools),
	}
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

		if err := callback(partial.Choice.Message.Content); err != nil {
			return err
		}
	}

	return nil
}
