package manager

import (
	"chat/adapter/chatgpt"
	"chat/auth"
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
	"time"
)

func GetImageLimitFormat(db *sql.DB, user *auth.User) string {
	return fmt.Sprintf(":imagelimit:%s:%d", time.Now().Format("2006-01-02"), user.GetID(db))
}

func GenerateImage(c *gin.Context, user *auth.User, prompt string) (string, error) {
	// free plan: 5 images per day
	// pro plan: 50 images per day

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	key := GetImageLimitFormat(db, user)
	usage := auth.GetDalleUsageLimit(db, user)

	prompt = strings.TrimSpace(prompt)
	if len(prompt) == 0 {
		return "", fmt.Errorf("please provide description for the image (e.g. /image an apple)")
	}

	if utils.IncrWithLimit(cache, key, 1, int64(usage), 60*60*24) || auth.ReduceDalle(db, user) {
		instance := chatgpt.NewChatInstanceFromModel(&chatgpt.InstanceProps{
			Model: "dalle",
		})

		response, err := instance.CreateImage(chatgpt.ImageProps{
			Prompt: prompt,
		})
		if err != nil {
			return "", err
		} else {
			return utils.GetImageMarkdown(response), nil
		}
	} else {
		return "", fmt.Errorf("you have reached your limit of %d free images per day, please buy more quota or wait until tomorrow", usage)
	}
}
