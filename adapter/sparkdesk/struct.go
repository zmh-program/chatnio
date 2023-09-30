package sparkdesk

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"github.com/spf13/viper"
	"net/url"
	"strings"
	"time"
)

type ChatInstance struct {
	AppId     string
	ApiSecret string
	ApiKey    string
	Model     string
	Endpoint  string
}

func NewChatInstance() *ChatInstance {
	return &ChatInstance{
		AppId:     viper.GetString("sparkdesk.app_id"),
		ApiSecret: viper.GetString("sparkdesk.api_secret"),
		ApiKey:    viper.GetString("sparkdesk.api_key"),
		Model:     viper.GetString("sparkdesk.model"),
		Endpoint:  viper.GetString("sparkdesk.endpoint"),
	}
}

func (c *ChatInstance) CreateUrl(host, date, auth string) string {
	v := make(url.Values)
	v.Add("host", host)
	v.Add("date", date)
	v.Add("authorization", auth)
	return fmt.Sprintf("%s?%s", c.Endpoint, v.Encode())
}

func (c *ChatInstance) Sign(data, key string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(data))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// GenerateUrl will generate the signed url for sparkdesk api
func (c *ChatInstance) GenerateUrl() string {
	uri, err := url.Parse(c.Endpoint)
	if err != nil {
		return ""
	}

	date := time.Now().UTC().Format(time.RFC1123)
	data := strings.Join([]string{
		fmt.Sprintf("host: %s", uri.Host),
		fmt.Sprintf("date: %s", date),
		fmt.Sprintf("GET %s HTTP/1.1", uri.Path),
	}, "\n")

	signature := c.Sign(data, c.ApiSecret)
	authorization := base64.StdEncoding.EncodeToString([]byte(
		fmt.Sprintf(
			"hmac username=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"",
			c.ApiKey,
			"hmac-sha256",
			"host date request-line",
			signature,
		),
	))

	return c.CreateUrl(uri.Host, date, authorization)
}
