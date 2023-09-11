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
	today := time.Now().Format("2006-01-02")
	return fmt.Sprintf(":imagelimit:%s:%d", today, id)
}

func GetImageWithUserLimit(user *auth.User, prompt string, db *sql.DB, cache *redis.Client) (string, error) {
	// free plan: 5 images per day
	// pro plan: 50 images per day

	key := GetLimitFormat(user.GetID(db))
	usage := auth.GetDalleUsageLimit(db, user)

	if utils.IncrWithLimit(cache, key, 1, int64(usage), 60*60*24) || auth.ReduceDalle(db, user) {
		return GetImageWithCache(context.Background(), prompt, cache)
	} else {
		return "", fmt.Errorf("you have reached your limit of %d free images per day, please buy more quota or wait until tomorrow", usage)
	}
}

func GetImageMarkdown(url string) string {
	return fmt.Sprintln("![image](", url, ")")
}
