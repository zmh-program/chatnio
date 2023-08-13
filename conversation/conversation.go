package conversation

import (
	"chat/types"
	"chat/utils"
	"database/sql"
	"errors"
)

type Conversation struct {
	UserID  int64                  `json:"user_id"`
	Id      int64                  `json:"id"`
	Name    string                 `json:"name"`
	Message []types.ChatGPTMessage `json:"message"`
}

type FormMessage struct {
	Message string `json:"message" binding:"required"`
}

func NewConversation(db *sql.DB, id int64) *Conversation {
	return &Conversation{
		UserID:  id,
		Id:      GetConversationLengthByUserID(db, id),
		Name:    "new chat",
		Message: []types.ChatGPTMessage{},
	}
}

func (c *Conversation) GetName() string {
	return c.Name
}

func (c *Conversation) SetName(db *sql.DB, name string) {
	c.Name = name
	c.SaveConversation(db)
}

func (c *Conversation) GetId() int64 {
	return c.Id
}

func (c *Conversation) GetUserID() int64 {
	return c.UserID
}

func (c *Conversation) SetId(id int64) {
	c.Id = id
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
	c.AddMessage(types.ChatGPTMessage{
		Role:    "user",
		Content: message,
	})
}

func (c *Conversation) AddMessageFromAssistant(message string) {
	c.AddMessage(types.ChatGPTMessage{
		Role:    "assistant",
		Content: message,
	})
}

func (c *Conversation) AddMessageFromSystem(message string) {
	c.AddMessage(types.ChatGPTMessage{
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

	c.AddMessageFromUser(form.Message)
	return form.Message, nil
}

func (c *Conversation) HandleMessage(db *sql.DB, data []byte) bool {
	_, err := c.AddMessageFromUserForm(data)
	if err != nil {
		return false
	}

	c.SaveConversation(db)
	return true
}

func (c *Conversation) SaveResponse(db *sql.DB, message string) {
	c.AddMessageFromAssistant(message)
	c.SaveConversation(db)
}
