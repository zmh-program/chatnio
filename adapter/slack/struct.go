package slack

import (
	"chat/globals"
	"fmt"
	"github.com/bincooo/claude-api"
	"github.com/bincooo/claude-api/types"
	"github.com/bincooo/claude-api/vars"
	"github.com/spf13/viper"
	"strings"
)

type ChatInstance struct {
	BotId    string
	Token    string
	Instance types.Chat
}

func (c *ChatInstance) GetBotId() string {
	return c.BotId
}

func (c *ChatInstance) GetToken() string {
	return c.Token
}

func (c *ChatInstance) GetInstance() types.Chat {
	return c.Instance
}

func NewChatInstance(botId, token string) *ChatInstance {
	options := claude.NewDefaultOptions(token, botId, vars.Model4Slack)
	if instance, err := claude.New(options); err != nil {
		return nil
	} else {
		return &ChatInstance{
			BotId:    botId,
			Token:    token,
			Instance: instance,
		}
	}
}

func NewChatInstanceFromConfig() *ChatInstance {
	return NewChatInstance(
		viper.GetString("slack.bot_id"),
		viper.GetString("slack.token"),
	)
}

func (c *ChatInstance) FormatMessage(message []globals.Message) string {
	result := make([]string, len(message))
	for i, item := range message {
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
				if err := hook(data.Text); err != nil {
					return err
				}
			}
		}
	}
}
