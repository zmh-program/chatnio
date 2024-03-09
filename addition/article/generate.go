package article

import (
	"chat/auth"
	"chat/globals"
	"chat/manager"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
)

type StreamProgressResponse struct {
	Current int     `json:"current"`
	Total   int     `json:"total"`
	Quota   float32 `json:"quota"`
}

type Response struct {
	File  string
	Quota float32
}

func GenerateArticle(c *gin.Context, user *auth.User, model string, hash string, title string, prompt string, enableWeb bool) Response {
	message, quota := manager.NativeChatHandler(c, user, model, []globals.Message{{
		Role:    globals.User,
		Content: fmt.Sprintf("%s\n%s", prompt, title),
	}}, enableWeb)

	return Response{
		File:  CreateArticleFile(hash, title, message),
		Quota: quota,
	}
}

func ParseTitle(titles string) []string {
	var result []string
	for _, title := range strings.Split(titles, "\n") {
		title = strings.TrimSpace(title)
		if len(title) > 0 {
			result = append(result, title)
		}
	}
	return result
}

func CreateGenerationWorker(c *gin.Context, user *auth.User, model string, prompt string, title string, enableWeb bool, hash string) (int, chan Response) {
	titles := ParseTitle(title)
	result := make(chan Response, len(titles))

	for _, name := range titles {
		go func(title string) {
			result <- GenerateArticle(c, user, model, hash, title, prompt, enableWeb)
		}(name)
	}

	return len(titles), result
}

func CreateWorker(c *gin.Context, user *auth.User, model string, prompt string, title string, enableWeb bool, hook func(resp StreamProgressResponse)) string {
	hash := utils.Md5Encrypt(fmt.Sprintf("%s%s%s%v", model, prompt, title, enableWeb))
	total, channel := CreateGenerationWorker(c, user, model, prompt, title, enableWeb, hash)
	current := 0

	hook(StreamProgressResponse{Current: current, Total: total, Quota: 0})

	for resp := range channel {
		current += 1
		hook(StreamProgressResponse{Current: current, Total: total, Quota: resp.Quota})

		if current == total {
			break
		}
	}

	hook(StreamProgressResponse{Current: current, Total: total, Quota: 0})

	path := fmt.Sprintf("storage/article/data/%s", hash)
	if _, _, err := utils.GenerateCompressTask(hash, "storage/article", path, path); err != nil {
		globals.Debug(fmt.Sprintf("[article] error during generate compress task: %s", err.Error()))
		return ""
	}

	return hash
}
