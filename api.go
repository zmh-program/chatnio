package main

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
	"strings"
	"time"
)

type AnonymousRequestBody struct {
	Message string `json:"message" required:"true"`
}

type ChatGPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func GetAnonymousResponse(message string) (string, error) {
	res, err := Post(viper.GetString("openai.anonymous_endpoint")+"/chat/completions", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + viper.GetString("openai.anonymous"),
	}, map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []ChatGPTMessage{
			{
				Role:    "user",
				Content: message,
			},
		},
		"max_tokens": 150,
	})
	if err != nil {
		return "", err
	}
	data := res.(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"]
	return data.(string), nil
}

func GetAnonymousResponseWithCache(c context.Context, message string) (string, error) {
	res, err := Cache.Get(c, fmt.Sprintf(":chatgpt:%s", message)).Result()
	if err != nil || len(res) == 0 {
		res, err := GetAnonymousResponse(message)
		if err != nil {
			return "There was something wrong...", err
		}
		Cache.Set(c, fmt.Sprintf(":chatgpt:%s", message), res, time.Hour*6)
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
