package conversation

import (
	"chat/globals"
	"chat/utils"
)

func (c *Conversation) LoadMask(data string) {
	message := utils.UnmarshalForm[[]globals.Message](data)
	if message != nil && len(*message) > 0 {
		c.InsertMessages(*message, 0)
	}
}
