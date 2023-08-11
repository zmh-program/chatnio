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
	keyword := strings.TrimSpace(SearchWeb(message))

	if len(keyword) == 0 {
		return keyword, message
	}
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
	for _, replacer := range []string{",", "、", "，", "。", "：", ":", "；", ";", "！", "!", "？", "?", "（", "）", "(", ")", "关键字", "空"} {
		content = strings.ReplaceAll(content, replacer, " ")
	}
	return strings.TrimSpace(content)
}

func SearchWeb(message []types.ChatGPTMessage) string {
	resp, _ := GetChatGPTResponse([]types.ChatGPTMessage{{
		Role:    "system",
		Content: "If the user input content require ONLINE SEARCH to get the results, please output these keywords to refine the data Interval with space, remember not to answer other content, json format return, format {\"keyword\": \"...\" }",
	}, {
		Role:    "user",
		Content: "你是谁",
	}, {
		Role:    "assistant",
		Content: "{\"keyword\":\"\"}",
	}, {
		Role:    "user",
		Content: "那fystart起始页是什么 和深能科创有什么关系",
	}, {
		Role:    "assistant",
		Content: "{\"keyword\":\"fystart起始页 深能科创 关系\"}",
	}, {
		Role:    "user",
		Content: "1+1=?",
	}, {
		Role:    "assistant",
		Content: "{\"keyword\":\"\"}",
	}, {
		Role:    "user",
		Content: message[len(message)-1].Content,
	}}, 40)
	keyword := utils.UnmarshalJson[map[string]interface{}](resp)
	return StringCleaner(keyword["keyword"].(string))
}
