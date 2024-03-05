package broadcast

import (
	"chat/globals"
	"chat/utils"
	"context"
	"github.com/gin-gonic/gin"
	"time"
)

func getLatestBroadcast(c *gin.Context) *Broadcast {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	if data, err := cache.Get(context.Background(), ":broadcast").Result(); err == nil {
		if broadcast := utils.UnmarshalForm[Broadcast](data); broadcast != nil {
			return broadcast
		}
	}

	var broadcast Broadcast
	if err := globals.QueryRowDb(db, `
		SELECT id, content FROM broadcast ORDER BY id DESC LIMIT 1;
	`).Scan(&broadcast.Index, &broadcast.Content); err != nil {
		return nil
	}

	cache.Set(context.Background(), ":broadcast", utils.Marshal(broadcast), 10*time.Minute)
	return &broadcast
}
