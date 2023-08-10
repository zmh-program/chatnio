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
	Message string `json:"message" required:"true"`
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
	data := res.(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"]
	return data.(string), nil
}

func GetAnonymousResponse(message string) (string, string, error) {
	keyword, source := ChatWithWeb([]types.ChatGPTMessage{{Role: "user", Content: message}})
	resp, err := GetChatGPTResponse(source, 1000)
	return keyword, resp, err
}

func GetAnonymousResponseWithCache(c *gin.Context, message string) (string, string, error) {
	cache := c.MustGet("cache").(*redis.Client)
	res, err := cache.Get(c, fmt.Sprintf(":chatgpt:%s", message)).Result()
	form := utils.UnmarshalJson[AnonymousResponseCache](res)
	if err != nil || len(res) == 0 || res == "{}" || form.Message == "" {
		key, res, err := GetAnonymousResponse(message)
		if err != nil {
			return "", "There was something wrong...", err
		}

		cache.Set(c, fmt.Sprintf(":chatgpt:%s", message), utils.ToJson(AnonymousResponseCache{
			Keyword: key,
			Message: res,
		}), time.Hour*6)
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
	key, res, err := GetAnonymousResponseWithCache(c, message)
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
