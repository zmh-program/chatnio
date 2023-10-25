package globals

import (
	"fmt"
	"time"
)

func GetImageLimitFormat(id int64) string {
	return fmt.Sprintf(":imagelimit:%s:%d", time.Now().Format("2006-01-02"), id)
}

func GetGPT4LimitFormat(id int64) string {
	return fmt.Sprintf(":subscription-usage:%s:%d", time.Now().Format("2006-01-02"), id)
}
