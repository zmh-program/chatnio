package web

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
	"time"
)

type Hook func(message []globals.Message, token int) (string, error)

func ChatWithWeb(message []globals.Message, long bool) []globals.Message {
	data := SearchBing(GetPointByLatestMessage(message))

	if long {
		data = utils.GetSegmentString(data, 6000)
	} else {
		data = utils.GetSegmentString(data, 3000)
	}
	return utils.Insert(message, 0, globals.Message{
		Role: globals.System,
		Content: fmt.Sprintf("你将扮演AI问答助手，你的知识库不是离线的，而是可以实时联网的，你可以提供实时联网的信息。"+
			"当前时间: %s, 实时联网搜索结果：%s",
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
