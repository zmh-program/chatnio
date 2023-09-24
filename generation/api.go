package generation

import (
	"chat/api"
	"chat/auth"
	"chat/middleware"
	"chat/types"
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"net/http"
	"strings"
)

type WebsocketGenerationForm struct {
	Token  string `json:"token" binding:"required"`
	Prompt string `json:"prompt" binding:"required"`
	Model  string `json:"model" binding:"required"`
}

func ProjectTarDownloadAPI(c *gin.Context) {
	hash := strings.TrimSpace(c.Query("hash"))
	c.Writer.Header().Add("Content-Disposition", "attachment; filename=code.tar.gz")
	c.File(fmt.Sprintf("generation/data/out/%s.tar.gz", hash))
}

func ProjectZipDownloadAPI(c *gin.Context) {
	hash := strings.TrimSpace(c.Query("hash"))
	c.Writer.Header().Add("Content-Disposition", "attachment; filename=code.zip")
	c.File(fmt.Sprintf("generation/data/out/%s.zip", hash))
}

func GenerateAPI(c *gin.Context) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := c.Request.Header.Get("Origin")
			if utils.Contains(origin, middleware.AllowedOrigins) {
				return true
			}
			return false
		},
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  err.Error(),
		})
		return
	}
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
			return
		}
	}(conn)

	_, message, err := conn.ReadMessage()
	if err != nil {
		return
	}
	form, err := utils.Unmarshal[WebsocketGenerationForm](message)
	if err != nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	if user == nil {
		return
	}

	db := c.MustGet("db").(*sql.DB)
	cache := c.MustGet("cache").(*redis.Client)

	id := user.GetID(db)
	if !utils.IncrWithLimit(cache, fmt.Sprintf(":generation:%d", id), 1, 30, 3600) {
		api.SendSegmentMessage(conn, types.GenerationSegmentResponse{
			End:   true,
			Error: "generation rate limit exceeded, the max generation rate is 30 per hour.",
		})
		return
	}

	useReverse := auth.CanEnableSubscription(db, cache, user)
	if !auth.CanEnableModelWithSubscription(db, user, form.Model, useReverse) {
		api.SendSegmentMessage(conn, types.ChatSegmentResponse{
			Message: "You don't have enough quota to use this model.",
			Quota:   0,
			End:     true,
		})
		return
	}

	var instance *api.Buffer
	hash, err := CreateGenerationWithCache(form.Model, form.Prompt, useReverse, func(buffer *api.Buffer, data string) {
		instance = buffer
		api.SendSegmentMessage(conn, types.GenerationSegmentResponse{
			End:     false,
			Message: data,
			Quota:   buffer.GetQuota(),
		})
	})

	if instance != nil && !useReverse {
		user.UseQuota(db, instance.GetQuota())
	}

	if err != nil {
		api.SendSegmentMessage(conn, types.GenerationSegmentResponse{
			End:   true,
			Error: err.Error(),
			Quota: instance.GetQuota(),
		})
		return
	}

	api.SendSegmentMessage(conn, types.GenerationSegmentResponse{
		End:   true,
		Hash:  hash,
		Quota: instance.GetQuota(),
	})
}
