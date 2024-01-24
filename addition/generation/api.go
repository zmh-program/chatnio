package generation

import (
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strconv"
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
	c.File(fmt.Sprintf("addition/generation/data/out/%s.tar.gz", hash))
}

func ProjectZipDownloadAPI(c *gin.Context) {
	hash := strings.TrimSpace(c.Query("hash"))
	c.Writer.Header().Add("Content-Disposition", "attachment; filename=code.zip")
	c.File(fmt.Sprintf("addition/generation/data/out/%s.zip", hash))
}

func GenerateAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c, false); conn == nil {
		return
	}
	defer conn.DeferClose()

	var form *WebsocketGenerationForm
	if form = utils.ReadForm[WebsocketGenerationForm](conn); form == nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	authenticated := user != nil

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	id := auth.GetId(db, user)

	if !utils.IncrWithLimit(cache,
		fmt.Sprintf(":generation:%s", utils.Multi[string](authenticated, strconv.FormatInt(id, 10), c.ClientIP())),
		1,
		30,
		3600,
	) {
		conn.Send(globals.GenerationSegmentResponse{
			End:   true,
			Error: "generation rate limit exceeded, the max generation rate is 30 per hour.",
		})
		return
	}

	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, form.Model)
	if !check {
		conn.Send(globals.GenerationSegmentResponse{
			Message: "You don't have enough quota to use this model.",
			Quota:   0,
			End:     true,
		})
		return
	}

	var instance *utils.Buffer
	hash, err := CreateGenerationWithCache(
		auth.GetGroup(db, user),
		form.Model,
		form.Prompt,
		plan,
		func(buffer *utils.Buffer, data string) {
			instance = buffer
			conn.Send(globals.GenerationSegmentResponse{
				End:     false,
				Message: data,
				Quota:   buffer.GetQuota(),
			})
		},
	)

	if instance != nil && !plan && instance.GetQuota() > 0 && user != nil {
		user.UseQuota(db, instance.GetQuota())
	}

	if err != nil {
		auth.RevertSubscriptionUsage(db, cache, user, form.Model)
		conn.Send(globals.GenerationSegmentResponse{
			End:   true,
			Error: err.Error(),
			Quota: instance.GetQuota(),
		})
		return
	}

	conn.Send(globals.GenerationSegmentResponse{
		End:   true,
		Hash:  hash,
		Quota: instance.GetQuota(),
	})
}
