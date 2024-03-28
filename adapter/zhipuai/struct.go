package zhipuai

import (
	factory "chat/adapter/common"
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
}

type Payload struct {
	ApiKey    string `json:"api_key"`
	Exp       int64  `json:"exp"`
	TimeStamp int64  `json:"timestamp"`
}

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func (c *ChatInstance) GetApiKey() string {
	return c.ApiKey
}

func (c *ChatInstance) GetHeader() map[string]string {
	return map[string]string{
		"Content-Type":  "application/json",
		"Authorization": fmt.Sprintf("Bearer %s", c.GetToken()),
	}
}

func (c *ChatInstance) GetToken() string {
	// get jwt token for zhipuai api
	segment := strings.Split(c.ApiKey, ".")
	if len(segment) != 2 {
		return ""
	}
	id, secret := segment[0], segment[1]

	payload := utils.MapToStruct[jwt.MapClaims](Payload{
		ApiKey:    id,
		Exp:       time.Now().Add(time.Minute*5).Unix() * 1000,
		TimeStamp: time.Now().Unix() * 1000,
	})

	instance := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	instance.Header = map[string]interface{}{
		"alg":       "HS256",
		"sign_type": "SIGN",
	}
	token, _ := instance.SignedString([]byte(secret))
	return token
}

func NewChatInstance(endpoint, apiKey string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apiKey,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	return NewChatInstance(
		conf.GetEndpoint(),
		conf.GetRandomSecret(),
	)
}
