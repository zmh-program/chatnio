package palm2

type PalmMessage struct {
	Author  string `json:"author"`
	Content string `json:"content"`
}

// ChatBody is the native http request body for palm2
type ChatBody struct {
	Prompt Prompt `json:"prompt"`
}

type Prompt struct {
	Messages []PalmMessage `json:"messages"`
}

// ChatResponse is the native http response body for palm2
type ChatResponse struct {
	Candidates []PalmMessage `json:"candidates"`
}
