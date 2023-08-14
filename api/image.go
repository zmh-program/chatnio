package api

import (
	"chat/auth"
	"chat/types"
	"chat/utils"
	"context"
	"database/sql"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"time"
)

func GetImage(prompt string) (string, error) {
	res, err := utils.Post(viper.GetString("openai.image_endpoint")+"/images/generations", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + GetRandomKey(viper.GetString("openai.image")),
	}, types.ChatGPTImageRequest{
		Prompt: prompt,
		Size:   "512x512",
		N:      1,
	})
	if err != nil || res == nil {
		return "", err
	}

	if err, ok := res.(map[string]interface{})["error"]; ok {
		return "", fmt.Errorf(err.(map[string]interface{})["message"].(string))
	}
	data := res.(map[string]interface{})["data"].([]interface{})[0].(map[string]interface{})["url"]
	return data.(string), nil
}

func GetImageWithCache(ctx context.Context, prompt string, cache *redis.Client) (string, error) {
	res, err := cache.Get(ctx, fmt.Sprintf(":image:%s", prompt)).Result()
	if err != nil || len(res) == 0 || res == "" {
		res, err := GetImage(prompt)
		if err != nil {
			return "", err
		}

		cache.Set(ctx, fmt.Sprintf(":image:%s", prompt), res, time.Hour*6)
		return res, nil
	}

	return res, nil
}

func GetImageWithUserLimit(user *auth.User, prompt string, db *sql.DB, cache *redis.Client) (string, error) {
	// 3 images one day per user (count by cache)
	res, err := cache.Get(context.Background(), fmt.Sprintf(":imagelimit:%d", user.GetID(db))).Result()
	if err != nil || len(res) == 0 || res == "" {
		cache.Set(context.Background(), fmt.Sprintf(":imagelimit:%d", user.GetID(db)), "1", time.Hour*24)
		return GetImageWithCache(context.Background(), prompt, cache)
	}

	if res == "3" {
		return "", fmt.Errorf("you have reached your limit of 3 images per day")
	} else {
		cache.Set(context.Background(), fmt.Sprintf(":imagelimit:%d", user.GetID(db)), fmt.Sprintf("%d", utils.ToInt(res)+1), time.Hour*24)
		return GetImageWithCache(context.Background(), prompt, cache)
	}
}
