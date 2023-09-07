package api

import (
	"chat/auth"
	"chat/types"
	"chat/utils"
)

type Buffer struct {
	Enable bool    `json:"enable"`
	Quota  float32 `json:"quota"`
	Data   string  `json:"data"`
	Cursor int     `json:"cursor"`
	Times  int     `json:"times"`
}

func NewBuffer(enable bool, history []types.ChatGPTMessage) *Buffer {
	buffer := &Buffer{Data: "", Cursor: 0, Times: 0, Enable: enable}
	if enable {
		buffer.Quota = auth.CountInputToken(utils.CountTokenPrice(history))
	}
	return buffer
}

func (b *Buffer) GetCursor() int {
	return b.Cursor
}

func (b *Buffer) GetQuota() float32 {
	if !b.Enable {
		return 0.
	}
	return b.Quota + auth.CountOutputToken(b.ReadTimes())
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

func (b *Buffer) ReadWithDefault(_default string) string {
	if b.IsEmpty() {
		return _default
	}
	return b.Data
}

func (b *Buffer) ReadTimes() int {
	return b.Times
}
