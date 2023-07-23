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

func GetAnonymousResponse(message string) (string, error) {
	res, err := utils.Post(viper.GetString("openai.anonymous_endpoint")+"/chat/completions", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + viper.GetString("openai.anonymous"),
	}, types.ChatGPTRequest{
		Model: "gpt-3.5-turbo-16k",
		Messages: []types.ChatGPTMessage{
			{
				Role:    "user",
				Content: message,
			},
		},
		MaxToken: 250,
	})
	if err != nil {
		return "", err
	}
	data := res.(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"]
	return data.(string), nil
}

func GetAnonymousResponseWithCache(c *gin.Context, message string) (string, error) {
	cache := c.MustGet("cache").(*redis.Client)
	res, err := cache.Get(c, fmt.Sprintf(":chatgpt:%s", message)).Result()
	if err != nil || len(res) == 0 {
		res, err := GetAnonymousResponse(message)
		if err != nil {
			return "There was something wrong...", err
		}
		cache.Set(c, fmt.Sprintf(":chatgpt:%s", message), res, time.Hour*6)
		return res, nil
	}
	return res, nil
}

func AnonymousAPI(c *gin.Context) {
	var body AnonymousRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  err.Error(),
		})
		return
	}
	message := strings.TrimSpace(body.Message)
	if len(message) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  "message is empty",
		})
		return
	}
	res, err := GetAnonymousResponseWithCache(c, message)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": res,
			"reason":  err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": res,
		"reason":  "",
	})
}
