package web

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"
)

type Hook func(message []globals.Message, token int) (string, error)

func ChatWithWeb(message []globals.Message) []globals.Message {
	data := utils.GetSegmentString(
		SearchWebResult(GetPointByLatestMessage(message)), 2048,
	)

	return utils.Insert(message, 0, globals.Message{
		Role: globals.System,
		Content: fmt.Sprintf("You will play the role of an AI Q&A assistant, where your knowledge base is not offline, but can be networked in real time, and you can provide real-time networked information with links to networked search sources."+
			"Current time: %s, Real-time internet search results: %s",
			time.Now().Format("2006-01-02 15:04:05"), data,
		),
	})
}

func StringCleaner(content string) string {
	for _, replacer := range []string{",", "、", "，", "。", "：", ":", "；", ";", "！", "!", "=", "？", "?", "（", "）", "(", ")", "关键字", "空", "1+1"} {
		content = strings.ReplaceAll(content, replacer, " ")
	}
	return strings.TrimSpace(content)
}

func GetKeywordPoint(hook Hook, message []globals.Message) string {
	resp, _ := hook([]globals.Message{{
		Role:    globals.System,
		Content: "If the user input content require ONLINE SEARCH to get the results, please output these keywords to refine the data Interval with space, remember not to answer other content, json format return, format {\"keyword\": \"...\" }",
	}, {
		Role:    globals.User,
		Content: "你是谁",
	}, {
		Role:    globals.Assistant,
		Content: "{\"keyword\":\"\"}",
	}, {
		Role:    globals.User,
		Content: "那fystart起始页是什么 和深能科创有什么关系",
	}, {
		Role:    globals.Assistant,
		Content: "{\"keyword\":\"fystart起始页 深能科创 关系\"}",
	}, {
		Role:    globals.User,
		Content: "1+1=?",
	}, {
		Role:    globals.Assistant,
		Content: "{\"keyword\":\"\"}",
	}, {
		Role:    globals.User,
		Content: "?",
	}, {
		Role:    globals.Assistant,
		Content: "{\"keyword\":\"\"}",
	}, {
		Role:    globals.User,
		Content: message[len(message)-1].Content,
	}}, 40)
	keyword := utils.UnmarshalJson[map[string]interface{}](resp)
	if keyword == nil {
		return ""
	}
	return StringCleaner(keyword["keyword"].(string))
}

func GetPointByLatestMessage(message []globals.Message) string {
	return StringCleaner(message[len(message)-1].Content)
}
