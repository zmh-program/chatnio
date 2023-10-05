package bing

// see https://github.com/Deeptrain-Community/chatnio-bing-service

type ChatRequest struct {
	Prompt  string                  `json:"prompt"`
	Cookies *map[string]interface{} `json:"cookies"`
	Model   string                  `json:"model"`
}

type ChatResponse struct {
	Response  string   `json:"response"`
	Suggested []string `json:"suggested"`
	Error     string   `json:"error"`
	End       bool     `json:"end"`
}
