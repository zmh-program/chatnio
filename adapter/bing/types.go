package bing

// see https://github.com/Deeptrain-Community/chatnio-bing-service

type ChatRequest struct {
	Prompt string `json:"prompt"`
	Hash   string `json:"hash"`
	Model  string `json:"model"`
}

type ChatResponse struct {
	Response string `json:"response"`
}
