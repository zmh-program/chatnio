package globals

type ToolCallId string
type FunctionTools []FunctionTool
type FunctionTool struct {
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Parameters  ToolParameters `json:"parameters"`
}

type ToolParameters struct {
	Type       string         `json:"type"`
	Properties ToolProperties `json:"properties"`
	Required   []string       `json:"required"`
}

type ToolProperties map[string]ToolProperty

type ToolProperty struct {
	Type        string   `json:"type"`
	Description string   `json:"description"`
	Enum        []string `json:"enum"`
}

type ToolCallFunction struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type ToolCall struct {
	Type     string           `json:"type"`
	Id       ToolCallId       `json:"id"`
	Function ToolCallFunction `json:"function"`
}
type ToolCalls []ToolCall
