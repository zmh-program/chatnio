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
	History         []globals.Message     `json:"history"`
	Images          Images                `json:"images"`
	ToolCalls       *globals.ToolCalls    `json:"tool_calls"`
	ToolCallsCursor int                   `json:"tool_calls_cursor"`
	FunctionCall    *globals.FunctionCall `json:"function_call"`
	Charge          Charge                `json:"-"`
}

func initInputToken(charge Charge, model string, history []globals.Message) float32 {
	if globals.IsOpenAIVisionModels(model) {
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

	return CountInputToken(charge, model, history)
}

func NewBuffer(model string, history []globals.Message, charge Charge) *Buffer {
	return &Buffer{
		Model:   model,
		Quota:   initInputToken(charge, model, history),
		History: history,
		Charge:  charge,
	}
}

func (b *Buffer) GetCursor() int {
	return b.Cursor
}

func (b *Buffer) GetQuota() float32 {
	return b.Quota + CountOutputToken(b.Charge, b.Model, b.ReadTimes())
}

func (b *Buffer) Write(data string) string {
	b.Data += data
	b.Cursor += len(data)
	b.Times++
	b.Latest = data
	return data
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

func (b *Buffer) AddToolCalls(toolCalls *globals.ToolCalls) {
	if toolCalls == nil {
		return
	}

	b.ToolCalls = toolCalls
	b.ToolCallsCursor += 1
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

func (b *Buffer) WriteBytes(data []byte) []byte {
	b.Write(string(data))
	return data
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

func (b *Buffer) ReadHistory() []globals.Message {
	return b.History
}

func (b *Buffer) CountInputToken() int {
	return GetWeightByModel(b.Model) * NumTokensFromMessages(b.History, b.Model)
}

func (b *Buffer) CountOutputToken() int {
	return b.ReadTimes() * GetWeightByModel(b.Model)
}

func (b *Buffer) CountToken() int {
	return b.CountInputToken() + b.CountOutputToken()
}
