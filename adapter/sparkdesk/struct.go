package sparkdesk

import (
	factory "chat/adapter/common"
	"chat/globals"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"
	"time"
)

type ChatInstance struct {
	AppId     string
	ApiSecret string
	ApiKey    string
	Endpoint  string
}

func TransformAddr(model string) string {
	switch model {
	case globals.SparkDeskLite:
		return "v1.1"
	case globals.SparkDeskPro:
		return "v3.1"
	case globals.SparkDeskMax:
		return "v3.5"
	case globals.SparkDeskV4Ultra:
		return "v4.0"
	default:
		return "v1.1"
	}
}

func TransformModel(model string) string {
	switch model {
	case globals.SparkDeskLite:
		return "general"
	case globals.SparkDeskPro:
		return "generalv3"
	case globals.SparkDeskPro128K:
		return "pro-128k"
	case globals.SparkDeskMax:
		return "generalv3.5"
	case globals.SparkDeskMax32K:
		return "max-32k"
	case globals.SparkDeskV4Ultra:
		return "4.0Ultra"
	default:
		return "general"
	}
}

func NewChatInstanceFromConfig(conf globals.ChannelConfig) factory.Factory {
	params := conf.SplitRandomSecret(3)

	return &ChatInstance{
		AppId:     params[0],
		ApiSecret: params[1],
		ApiKey:    params[2],
		Endpoint:  conf.GetEndpoint(),
	}
}

func (c *ChatInstance) CreateUrl(endpoint, host, date, auth string) string {
	v := make(url.Values)
	v.Add("host", host)
	v.Add("date", date)
	v.Add("authorization", auth)
	return fmt.Sprintf("%s?%s", endpoint, v.Encode())
}

func (c *ChatInstance) Sign(data, key string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(data))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// GenerateUrl will generate the signed url for sparkdesk api
func (c *ChatInstance) GenerateUrl(endpoint string) string {
	uri, err := url.Parse(endpoint)
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

	return c.CreateUrl(endpoint, uri.Host, date, authorization)
}
