package card

import (
	"chat/globals"
	"chat/manager"
	"github.com/gin-gonic/gin"
	"github.com/russross/blackfriday/v2"
	"net/http"
	"strings"
)

type RequestForm struct {
	Message string `json:"message" required:"true"`
	Web     bool   `json:"web"`
}

const maxColumnPerLine = 50

func ProcessMarkdownLine(source []byte) string {
	segment := strings.Split(string(source), "\n")
	var result []rune
	for _, line := range segment {
		data := []rune(line)
		length := len([]rune(line))
		if length < maxColumnPerLine {
			result = append(result, data...)
			result = append(result, '\n')
		} else {
			for i := 0; i < length; i += maxColumnPerLine {
				if i+maxColumnPerLine < length {
					result = append(result, data[i:i+maxColumnPerLine]...)
					result = append(result, '\n')
				} else {
					result = append(result, data[i:]...)
					result = append(result, '\n')
				}
			}
		}
	}
	return string(result)
}

func MarkdownConvert(text string) string {
	if text == "" {
		return ""
	}

	result := blackfriday.Run([]byte(text))
	return string(result)
}

func HandlerAPI(c *gin.Context) {
	var body RequestForm
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
	}
	message := strings.TrimSpace(body.Message)
	if len(message) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "message is empty",
		})
		return
	}

	response, quota := manager.NativeChatHandler(c, nil, globals.GPT3Turbo0613, []globals.Message{
		{Role: globals.User, Content: message},
	}, body.Web)

	c.JSON(http.StatusOK, gin.H{
		"message": MarkdownConvert(response),
		"keyword": "",
		"quota":   quota,
	})
}
