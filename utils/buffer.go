package utils

import (
	"chat/globals"
	"strings"
)

type Charge interface {
	GetType() string
	GetModels() []string
	GetInput() float32
	GetOutput() float32
	SupportAnonymous() bool
	IsBilling() bool
	IsBillingType(t string) bool
	GetLimit() float32
}

type Buffer struct {
	Model           string                `json:"model"`
	Quota           float32               `json:"quota"`
	Data            string                `json:"data"`
	Latest          string                `json:"latest"`
	Cursor          int                   `json:"cursor"`
	Times           int                   `json:"times"`
	InputTokens     int                   `json:"input_tokens"`
	Images          Images                `json:"images"`
	ToolCalls       *globals.ToolCalls    `json:"tool_calls"`
	ToolCallsCursor int                   `json:"tool_calls_cursor"`
	FunctionCall    *globals.FunctionCall `json:"function_call"`
	Charge          Charge                `json:"-"`
}

func initInputToken(model string, history []globals.Message) int {
	if globals.IsVisionModel(model) {
		for _, message := range history {
			if message.Role == globals.User {
				content, _ := ExtractImages(message.Content, true)
				message.Content = content
			}
		}

		history = Each(history, func(message globals.Message) globals.Message {
			if message.Role == globals.User {
				raw, _ := ExtractImages(message.Content, true)
				return globals.Message{
					Role:         message.Role,
					Content:      raw,
					Name:         message.Name,
					FunctionCall: message.FunctionCall,
					ToolCalls:    message.ToolCalls,
					ToolCallId:   message.ToolCallId,
				}
			}

			return message
		})
	}

	return NumTokensFromMessages(history, model, false)
}

func NewBuffer(model string, history []globals.Message, charge Charge) *Buffer {
	token := initInputToken(model, history)

	return &Buffer{
		Model:           model,
		Quota:           CountInputQuota(charge, token),
		InputTokens:     token,
		Charge:          charge,
		FunctionCall:    nil,
		ToolCalls:       nil,
		ToolCallsCursor: 0,
	}
}

func (b *Buffer) GetCursor() int {
	return b.Cursor
}

func (b *Buffer) GetQuota() float32 {
	return b.Quota + CountOutputToken(b.Charge, b.CountOutputToken(false))
}

func (b *Buffer) Write(data string) string {
	b.Data += data
	b.Cursor += len(data)
	b.Times++
	b.Latest = data
	return data
}

func (b *Buffer) WriteChunk(data *globals.Chunk) string {
	if data == nil {
		return ""
	}

	b.Write(data.Content)
	b.AddToolCalls(data.ToolCall)
	b.SetFunctionCall(data.FunctionCall)

	return data.Content
}

func (b *Buffer) GetChunk() string {
	return b.Latest
}

func (b *Buffer) AddImage(image *Image) {
	if image != nil {
		b.Images = append(b.Images, *image)
	}

	if b.Charge.IsBillingType(globals.TokenBilling) {
		if image != nil {
			b.Quota += float32(image.CountTokens(b.Model)) * b.Charge.GetInput()
		}
	}
}

func (b *Buffer) GetImages() Images {
	return b.Images
}

func (b *Buffer) SetToolCalls(toolCalls *globals.ToolCalls) {
	b.ToolCalls = toolCalls
}

func hitTool(tool globals.ToolCall, tools globals.ToolCalls) (int, *globals.ToolCall) {
	for i, t := range tools {
		if t.Id == tool.Id {
			return i, &t
		}
	}

	if len(tool.Type) == 0 && len(tool.Id) == 0 {
		length := len(tools)

		if length > 0 {
			// if the tool is empty, return the last tool as the hit
			return length - 1, &tools[length-1]
		}
	}

	return 0, nil
}

func mixTools(source *globals.ToolCalls, target *globals.ToolCalls) *globals.ToolCalls {
	if source == nil {
		return target
	}

	tools := make(globals.ToolCalls, 0)
	arr := Collect[globals.ToolCall](*source, *target)

	for _, tool := range arr {
		idx, hit := hitTool(tool, tools)

		if hit != nil {
			tools[idx].Function.Arguments += tool.Function.Arguments
		} else {
			tools = append(tools, tool)
		}
	}

	return &tools
}

func (b *Buffer) AddToolCalls(toolCalls *globals.ToolCalls) {
	if toolCalls == nil {
		return
	}

	b.ToolCalls = mixTools(b.ToolCalls, toolCalls)
}

func (b *Buffer) SetFunctionCall(functionCall *globals.FunctionCall) {
	if functionCall == nil {
		return
	}

	b.FunctionCall = functionCall
}

func (b *Buffer) GetToolCalls() *globals.ToolCalls {
	calls := b.ToolCalls
	b.ToolCalls = nil

	return calls
}

func (b *Buffer) GetFunctionCall() *globals.FunctionCall {
	return b.FunctionCall
}

func (b *Buffer) IsFunctionCalling() bool {
	return b.FunctionCall != nil || b.ToolCalls != nil
}

func (b *Buffer) IsEmpty() bool {
	return b.Cursor == 0 && !b.IsFunctionCalling()
}

func (b *Buffer) GetModel() string {
	return b.Model
}

func (b *Buffer) GetCharge() Charge {
	return b.Charge
}

func (b *Buffer) Read() string {
	return b.Data
}

func (b *Buffer) ReadBytes() []byte {
	return []byte(b.Data)
}

func (b *Buffer) ReadWithDefault(_default string) string {
	if b.IsEmpty() || (len(strings.TrimSpace(b.Data)) == 0 && !b.IsFunctionCalling()) {
		return _default
	}
	return b.Data
}

func (b *Buffer) ReadTimes() int {
	return b.Times
}

func (b *Buffer) SetInputTokens(tokens int) {
	b.InputTokens = tokens
}

func (b *Buffer) CountInputToken() int {
	return b.InputTokens
}

func (b *Buffer) CountOutputToken(running bool) int {
	if running {
		// performance optimization:
		// if the buffer is still running, the output token counted using the times instead
		return b.Times
	}

	return NumTokensFromResponse(b.Read(), b.Model)
}

func (b *Buffer) CountToken() int {
	return b.CountInputToken() + b.CountOutputToken(false)
}
