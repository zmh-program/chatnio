package utils

import (
	"chat/globals"
	"strings"
)

type Buffer struct {
	Model  string  `json:"model"`
	Quota  float32 `json:"quota"`
	Data   string  `json:"data"`
	Cursor int     `json:"cursor"`
	Times  int     `json:"times"`
}

func NewBuffer(model string, history []globals.Message) *Buffer {
	return &Buffer{
		Data:   "",
		Cursor: 0,
		Times:  0,
		Model:  model,
		Quota:  CountInputToken(model, history),
	}
}

func (b *Buffer) GetCursor() int {
	return b.Cursor
}

func (b *Buffer) GetQuota() float32 {
	return b.Quota + CountOutputToken(b.Model, b.ReadTimes())
}

func (b *Buffer) Write(data string) string {
	b.Data += data
	b.Cursor += len(data)
	b.Times++
	return data
}

func (b *Buffer) WriteBytes(data []byte) []byte {
	b.Data += string(data)
	b.Cursor += len(data)
	b.Times++
	return data
}

func (b *Buffer) IsEmpty() bool {
	return b.Cursor == 0
}

func (b *Buffer) Reset() {
	b.Data = ""
	b.Cursor = 0
	b.Times = 0
}

func (b *Buffer) Read() string {
	return b.Data
}

func (b *Buffer) ReadBytes() []byte {
	return []byte(b.Data)
}

func (b *Buffer) ReadWithDefault(_default string) string {
	if b.IsEmpty() || len(strings.TrimSpace(b.Data)) == 0 {
		return _default
	}
	return b.Data
}

func (b *Buffer) ReadTimes() int {
	return b.Times
}
