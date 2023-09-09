package api

import (
	"chat/types"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"net/http"
	"strings"
	"time"
)

type AnonymousRequestBody struct {
	Message string                 `json:"message" required:"true"`
	Web     bool                   `json:"web"`
	History []types.ChatGPTMessage `json:"history"`
}

type AnonymousResponseCache struct {
	Keyword string `json:"keyword"`
	Message string `json:"message"`
}

func GetChatGPTResponse(message []types.ChatGPTMessage, token int) (string, error) {
	res, err := utils.Post(viper.GetString("openai.anonymous_endpoint")+"/chat/completions", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + GetRandomKey(viper.GetString("openai.anonymous")),
	}, types.ChatGPTRequest{
		Model:    "gpt-3.5-turbo",
		Messages: message,
		MaxToken: token,
	})
	if err != nil || res == nil {
		return "", err
	}

	if res.(map[string]interface{})["choices"] == nil {
		return res.(map[string]interface{})["error"].(map[string]interface{})["message"].(string), nil
	}
	data := res.(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"]
	return data.(string), nil
}

func TestKey(key string) bool {
	res, err := utils.Post(viper.GetString("openai.anonymous_endpoint")+"/chat/completions", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + key,
	}, types.ChatGPTRequest{
		Model:    "gpt-3.5-turbo",
		Messages: []types.ChatGPTMessage{{Role: "user", Content: "hi"}},
		MaxToken: 2,
	})
	if err != nil || res == nil {
		panic(err)
	}

	return res.(map[string]interface{})["choices"] != nil
}

func GetAnonymousResponse(message []types.ChatGPTMessage, web bool) (string, string, error) {
	if !web {
		resp, err := GetChatGPTResponse(message, 1000)
		return "", resp, err
	}
	keyword, source := ChatWithWeb(message, false)
	resp, err := GetChatGPTResponse(source, 1000)
	return keyword, resp, err
}

func GetSegmentMessage(data []types.ChatGPTMessage, length int) []types.ChatGPTMessage {
	if len(data) <= length {
		return data
	}
	return data[len(data)-length:]
}

func GetAnonymousMessage(message string, history []types.ChatGPTMessage) []types.ChatGPTMessage {
	return append(
		GetSegmentMessage(history, 5),
		types.ChatGPTMessage{
			Role:    "user",
			Content: strings.TrimSpace(message),
		})
}

func GetAnonymousResponseWithCache(c *gin.Context, message string, web bool, history []types.ChatGPTMessage) (string, string, error) {
	segment := GetAnonymousMessage(message, history)
	hash := utils.Md5Encrypt(utils.ToJson(segment))
	cache := c.MustGet("cache").(*redis.Client)
	res, err := cache.Get(c, fmt.Sprintf(":chatgpt-%v:%s", web, hash)).Result()
	form := utils.UnmarshalJson[AnonymousResponseCache](res)
	if err != nil || len(res) == 0 || res == "{}" || form.Message == "" {
		key, res, err := GetAnonymousResponse(segment, web)
		if err != nil {
			return "", "There was something wrong...", err
		}

		cache.Set(c, fmt.Sprintf(":chatgpt-%v:%s", web, hash), utils.ToJson(AnonymousResponseCache{
			Keyword: key,
			Message: res,
		}), time.Hour*48)
		return key, res, nil
	}
	return form.Keyword, form.Message, nil
}

func AnonymousAPI(c *gin.Context) {
	var body AnonymousRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"keyword": "",
			"reason":  err.Error(),
		})
		return
	}
	message := strings.TrimSpace(body.Message)
	if len(message) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"keyword": "",
			"reason":  "message is empty",
		})
		return
	}

	key, res, err := GetAnonymousResponseWithCache(c, message, body.Web, body.History)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": res,
			"keyword": key,
			"reason":  err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": res,
		"keyword": key,
		"reason":  "",
	})
}
