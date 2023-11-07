package admin

import (
	"fmt"
	"time"
)

func getMonth() string {
	date := time.Now()
	return date.Format("2006-01")
}

func getDay() string {
	date := time.Now()
	return date.Format("2006-01-02")
}

func getDays(n int) []time.Time {
	current := time.Now()
	var days []time.Time
	for i := n; i > 0; i-- {
		days = append(days, current.AddDate(0, 0, -i+1))
	}

	return days
}

func getErrorFormat(t string) string {
	return fmt.Sprintf("nio:err-analysis-%s", t)
}

func getBillingFormat(t string) string {
	return fmt.Sprintf("nio:billing-analysis-%s", t)
}

func getMonthBillingFormat(t string) string {
	return fmt.Sprintf("nio:billing-analysis-%s", t)
}

func getRequestFormat(t string) string {
	return fmt.Sprintf("nio:request-analysis-%s", t)
}

func getModelFormat(t string, model string) string {
	return fmt.Sprintf("nio:model-analysis-%s-%s", model, t)
}
