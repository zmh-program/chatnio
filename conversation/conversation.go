package conversation

import (
	"chat/types"
	"chat/utils"
	"errors"
)

type Conversation struct {
	Username string                 `json:"username"`
	Id       int64                  `json:"id"`
	Message  []types.ChatGPTMessage `json:"message"`
}

type FormMessage struct {
	Message string `json:"message" binding:"required"`
}

func NewConversation(username string, id int64) *Conversation {
	return &Conversation{
		Username: username,
		Id:       id,
		Message:  []types.ChatGPTMessage{},
	}
}

func (c *Conversation) GetUsername() string {
	return c.Username
}

func (c *Conversation) GetId() int64 {
	return c.Id
}

func (c *Conversation) GetMessage() []types.ChatGPTMessage {
	return c.Message
}

func (c *Conversation) GetMessageSize() int {
	return len(c.Message)
}

func (c *Conversation) GetMessageSegment(length int) []types.ChatGPTMessage {
	if length > len(c.Message) {
		return c.Message
	}
	return c.Message[len(c.Message)-length:]
}

func (c *Conversation) GetLastMessage() types.ChatGPTMessage {
	return c.Message[len(c.Message)-1]
}

func (c *Conversation) AddMessage(message types.ChatGPTMessage) {
	c.Message = append(c.Message, message)
}

func (c *Conversation) AddMessageFromUser(message string) {
	c.Message = append(c.Message, types.ChatGPTMessage{
		Role:    "user",
		Content: message,
	})
}

func (c *Conversation) AddMessageFromAssistant(message string) {
	c.Message = append(c.Message, types.ChatGPTMessage{
		Role:    "assistant",
		Content: message,
	})
}

func (c *Conversation) AddMessageFromSystem(message string) {
	c.Message = append(c.Message, types.ChatGPTMessage{
		Role:    "system",
		Content: message,
	})
}

func GetMessage(data []byte) (string, error) {
	form, err := utils.Unmarshal[FormMessage](data)
	if err != nil {
		return "", err
	}
	if len(form.Message) == 0 {
		return "", errors.New("message is empty")
	}
	return form.Message, nil
}

func (c *Conversation) AddMessageFromUserForm(data []byte) (string, error) {
	form, err := utils.Unmarshal[FormMessage](data)
	if err != nil {
		return "", err
	} else if len(form.Message) == 0 {
		return "", errors.New("message is empty")
	}

	c.Message = append(c.Message, types.ChatGPTMessage{
		Role:    "user",
		Content: form.Message,
	})
	return form.Message, nil
}
