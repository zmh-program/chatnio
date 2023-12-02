package zhipuai

import (
	"chat/globals"
	"chat/utils"
	"github.com/dgrijalva/jwt-go"
	"strings"
	"time"
)

type ChatInstance struct {
	Endpoint string
	ApiKey   string
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

func (c *ChatInstance) GetEndpoint() string {
	return c.Endpoint
}

func NewChatInstance(endpoint, apikey string) *ChatInstance {
	return &ChatInstance{
		Endpoint: endpoint,
		ApiKey:   apikey,
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) *ChatInstance {
	return NewChatInstance(conf.GetEndpoint(), conf.GetRandomSecret())
}
