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

func GetLimitFormat(id int64) string {
	t := time.Now().Format("2006-01-02")
	return fmt.Sprintf(":imagelimit:%s:%d", t, id)
}

func GetImageWithUserLimit(user *auth.User, prompt string, db *sql.DB, cache *redis.Client) (string, error) {
	// 5 images one day per user (count by cache)
	res, err := cache.Get(context.Background(), GetLimitFormat(user.GetID(db))).Result()
	if err != nil || len(res) == 0 || res == "" {
		cache.Set(context.Background(), GetLimitFormat(user.GetID(db)), "1", time.Hour*24)
		return GetImageWithCache(context.Background(), prompt, cache)
	}

	if res == "5" {
		if auth.ReduceDalle(db, user) {
			return GetImageWithCache(context.Background(), prompt, cache)
		}
		return "", fmt.Errorf("you have reached your limit of 5 free images per day, please buy more dalle usage or wait until tomorrow")
	} else {
		cache.Set(context.Background(), GetLimitFormat(user.GetID(db)), fmt.Sprintf("%d", utils.ToInt(res)+1), time.Hour*24)
		return GetImageWithCache(context.Background(), prompt, cache)
	}
}
