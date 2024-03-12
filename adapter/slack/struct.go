package slack

import (
	factory "chat/adapter/common"
	"chat/globals"
	"fmt"
	"github.com/bincooo/claude-api"
	"github.com/bincooo/claude-api/types"
	"github.com/bincooo/claude-api/vars"
	"strings"
)

type ChatInstance struct {
	BotId    string
	Token    string
	Channel  string
	Instance types.Chat
}

func (c *ChatInstance) GetBotId() string {
	return c.BotId
}

func (c *ChatInstance) GetToken() string {
	return c.Token
}

func (c *ChatInstance) GetChannel() string {
	return c.Channel
}

func (c *ChatInstance) GetInstance() types.Chat {
	return c.Instance
}

func NewChatInstance(botId, token, channel string) *ChatInstance {
	options := claude.NewDefaultOptions(token, botId, vars.Model4Slack)
	if instance, err := claude.New(options); err != nil {
		return nil
	} else {
		return &ChatInstance{
			BotId:    botId,
			Token:    token,
			Channel:  channel,
			Instance: instance,
		}
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	params := conf.SplitRandomSecret(2)
	return NewChatInstance(
		params[0], params[1],
		conf.GetEndpoint(),
	)
}

func (c *ChatInstance) FormatMessage(message []globals.Message) string {
	result := make([]string, len(message))
	for i, item := range message {
		if item.Role == globals.Tool {
			continue
		}
		result[i] = fmt.Sprintf("%s: %s", item.Role, item.Content)
	}

	return strings.Join(result, "\n\n")
}

func (c *ChatInstance) ProcessPartialResponse(res chan types.PartialResponse, hook globals.Hook) error {
	for {
		select {
		case data, ok := <-res:
			if !ok {
				return nil
			}

			if data.Error != nil {
				return data.Error
			} else if data.Text != "" {
				if err := hook(&globals.Chunk{Content: data.Text}); err != nil {
					return err
				}
			}
		}
	}
}
