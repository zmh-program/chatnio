package api

import (
	"chat/types"
	"chat/utils"
	"chat/web"
	"fmt"
	"time"
)

func ChatWithWeb(message []types.ChatGPTMessage, current string) []types.ChatGPTMessage {
	return utils.Insert(message, 0, types.ChatGPTMessage{
		Role:    "system",
		Content: fmt.Sprintf("你将扮演AI问答助手，你的知识库不是截止于2021年9月，而是可以实时联网的，你可以提供实时联网的知识库。当前时间: %s, 你的知识库：%s", time.Now().Format("2006-01-02 15:04:05"), web.SearchBing(current)),
	})
}
