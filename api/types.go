package api

type ChatGPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
