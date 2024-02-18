package globals

type ToolCallId string
type FunctionTools []ToolObject
type ToolObject struct {
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Url         *string        `json:"url,omitempty"`
	Parameters  ToolParameters `json:"parameters"`
}

type ToolParameters struct {
	Type       string         `json:"type"`
	Properties ToolProperties `json:"properties"`
	Required   []string       `json:"required"`
}

type ToolProperties map[string]ToolProperty

type ToolProperty struct {
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Enum        *[]string `json:"enum,omitempty"`
	Items       *ToolItem `json:"items,omitempty"`
	MinItems    *int      `json:"minItems,omitempty"`
	MaxItems    *int      `json:"maxItems,omitempty"`
}

type ToolItem map[string]string

type ToolCallFunction struct {
	Name      string `json:"name,omitempty"`
	Arguments string `json:"arguments,omitempty"`
}

type ToolCall struct {
	Index    *int             `json:"index,omitempty"`
	Type     string           `json:"type"`
	Id       ToolCallId       `json:"id"`
	Function ToolCallFunction `json:"function"`
}
type ToolCalls []ToolCall

type FunctionCall struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}
