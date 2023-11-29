package globals

type Hook func(data string) error
type Message struct {
	Role       string     `json:"role"`
	Content    string     `json:"content"`
	ToolCallId *string    `json:"tool_call_id,omitempty"` // only `tool` role
	ToolCalls  *ToolCalls `json:"tool_calls,omitempty"`   // only `assistant` role
}

type ChatSegmentResponse struct {
	Conversation int64   `json:"conversation"`
	Quota        float32 `json:"quota"`
	Keyword      string  `json:"keyword"`
	Message      string  `json:"message"`
	End          bool    `json:"end"`
	Plan         bool    `json:"plan"`
}

type GenerationSegmentResponse struct {
	Quota   float32 `json:"quota"`
	Message string  `json:"message"`
	Hash    string  `json:"hash"`
	End     bool    `json:"end"`
	Error   string  `json:"error"`
}
