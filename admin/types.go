package admin

type InfoForm struct {
	BillingToday      float32 `json:"billing_today"`
	BillingMonth      float32 `json:"billing_month"`
	SubscriptionCount int64   `json:"subscription_count"`
}

type ModelData struct {
	Model string  `json:"model"`
	Data  []int64 `json:"data"`
}

type ModelChartForm struct {
	Date  []string    `json:"date"`
	Value []ModelData `json:"value"`
}

type RequestChartForm struct {
	Date  []string `json:"date"`
	Value []int64  `json:"value"`
}

type BillingChartForm struct {
	Date  []string  `json:"date"`
	Value []float32 `json:"value"`
}

type ErrorChartForm struct {
	Date  []string `json:"date"`
	Value []int64  `json:"value"`
}
