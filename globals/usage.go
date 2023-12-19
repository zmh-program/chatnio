package globals

import (
	"fmt"
)

func GetSubscriptionLimitFormat(t string, id int64) string {
	return fmt.Sprintf("usage-%s:%d", t, id)
}
