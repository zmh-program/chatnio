package globals

import (
	"fmt"
	"time"
)

func GetSubscriptionLimitFormat(t string, id int64) string {
	return fmt.Sprintf(":subscription-usage-%s:%s:%d", t, time.Now().Format("2006-01-02"), id)
}
