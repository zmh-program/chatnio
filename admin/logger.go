package admin

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"strings"
)

type LogFile struct {
	Path string `json:"path"`
	Size int64  `json:"size"`
}

func ListLogs() []LogFile {
	return utils.Each(utils.Walk("logs"), func(path string) LogFile {
		return LogFile{
			Path: strings.TrimLeft(path, "logs/"),
			Size: utils.GetFileSize(path),
		}
	})
}

func getLogPath(path string) string {
	return fmt.Sprintf("logs/%s", path)
}

func getBlobFile(c *gin.Context, path string) {
	c.File(getLogPath(path))
}

func deleteLogFile(path string) error {
	return utils.DeleteFile(getLogPath(path))
}

func getLatestLogs(n int) string {
	if n <= 0 {
		n = 100
	}

	content, err := utils.ReadFileLatestLines(getLogPath(globals.DefaultLoggerFile), n)

	if err != nil {
		return fmt.Sprintf("read error: %s", err.Error())
	}

	return content
}
