package api

import (
	"chat/types"
	"chat/utils"
	"chat/web"
	"fmt"
	"math/rand"
	"strings"
	"time"
)

func ChatWithWeb(message []types.ChatGPTMessage) (string, []types.ChatGPTMessage) {
	keyword := SearchWeb(message)
	return keyword, utils.Insert(message, 0, types.ChatGPTMessage{
		Role: "system",
		Content: fmt.Sprintf("你将扮演AI问答助手，你的知识库不是截止于2021年9月，而是可以实时联网的，你可以提供实时联网的知识库。"+
			"官网网站使用链接包裹，给予用户精确的答复。"+
			"当前时间: %s, 你的知识库：%s",
			time.Now().Format("2006-01-02 15:04:05"), web.SearchBing(keyword),
		),
	})
}

func GetRandomKey(apikey string) string {
	arr := strings.Split(apikey, "|")
	idx := rand.Intn(len(arr))
	return arr[idx]
}

func StringCleaner(content string) string {
	for _, replacer := range []string{",", "、", "，", "。", "：", ":", "；", ";", "！", "!", "？", "?", "（", "）", "(", ")", "关键字"} {
		content = strings.ReplaceAll(content, replacer, " ")
	}
	return strings.TrimSpace(content)
}

func SearchWeb(message []types.ChatGPTMessage) string {
	source := make([]string, 0)
	for _, item := range message {
		if item.Role == "user" && item.Content != "" {
			source = append(source, item.Content)
		}
	}
	if len(source) == 0 {
		return ""
	}

	source = utils.GetLatestSegment(source, 3)
	keyword, _ := GetChatGPTResponse([]types.ChatGPTMessage{{
		Role: "user",
		Content: fmt.Sprintf("你是一个AI助手，我将你用来总结用户输入的内容并输出到bing搜索引擎上，"+
			"请总结关键字，不要输出其他内容，不能输出特殊字符：\n%s", strings.Join(source, " ")),
	}}, 40)

	return StringCleaner(keyword)
}
