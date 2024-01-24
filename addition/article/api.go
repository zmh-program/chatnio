package article

import (
	"chat/auth"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
)

type WebsocketArticleForm struct {
	Token  string `json:"token" binding:"required"`
	Model  string `json:"model" binding:"required"`
	Prompt string `json:"prompt" binding:"required"`
	Title  string `json:"title" binding:"required"`
	Web    bool   `json:"web"`
}

type WebsocketArticleResponse struct {
	Hash string                 `json:"hash"`
	Data StreamProgressResponse `json:"data"`
}

func ProjectTarDownloadAPI(c *gin.Context) {
	hash := strings.TrimSpace(c.Query("hash"))
	c.Writer.Header().Add("Content-Disposition", "attachment; filename=article.tar.gz")
	c.File(fmt.Sprintf("addition/article/data/out/%s.tar.gz", hash))
}

func ProjectZipDownloadAPI(c *gin.Context) {
	hash := strings.TrimSpace(c.Query("hash"))
	c.Writer.Header().Add("Content-Disposition", "attachment; filename=article.zip")
	c.File(fmt.Sprintf("addition/article/data/out/%s.zip", hash))
}

func GenerateAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c, false); conn == nil {
		return
	}
	defer conn.DeferClose()

	var form *WebsocketArticleForm
	if form = utils.ReadForm[WebsocketArticleForm](conn); form == nil {
		return
	}

	user := auth.ParseToken(c, form.Token)
	db := utils.GetDBFromContext(c)

	if !(user != nil && user.IsSubscribe(db)) {
		return
	}

	if len(form.Title) == 0 {
		return
	}

	hash := CreateWorker(c, user, form.Model, form.Prompt, form.Title, form.Web, func(resp StreamProgressResponse) {
		conn.Send(WebsocketArticleResponse{
			Hash: "",
			Data: resp,
		})
	})
	conn.Send(WebsocketArticleResponse{
		Hash: hash,
	})
}
