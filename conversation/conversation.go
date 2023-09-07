package conversation

import (
	"chat/types"
	"chat/utils"
	"database/sql"
	"errors"
	"strings"
)

type Conversation struct {
	UserID     int64                  `json:"user_id"`
	Id         int64                  `json:"id"`
	Name       string                 `json:"name"`
	Message    []types.ChatGPTMessage `json:"message"`
	EnableGPT4 bool                   `json:"enable_gpt4"`
	EnableWeb  bool                   `json:"enable_web"`
}

type FormMessage struct {
	Type    string `json:"type"` // ping
	Message string `json:"message"`
	Web     bool   `json:"web"`
	GPT4    bool   `json:"gpt4"`
}

func NewConversation(db *sql.DB, id int64) *Conversation {
	return &Conversation{
		UserID:     id,
		Id:         GetConversationLengthByUserID(db, id) + 1,
		Name:       "new chat",
		Message:    []types.ChatGPTMessage{},
		EnableGPT4: false,
		EnableWeb:  false,
	}
}

func (c *Conversation) IsEnableGPT4() bool {
	return c.EnableGPT4
}

func (c *Conversation) IsEnableWeb() bool {
	return c.EnableWeb
}

func (c *Conversation) SetEnableGPT4(enable bool) {
	c.EnableGPT4 = enable
}

func (c *Conversation) SetEnableWeb(enable bool) {
	c.EnableWeb = enable
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

func CopyMessage(message []types.ChatGPTMessage) []types.ChatGPTMessage {
	return utils.UnmarshalJson[[]types.ChatGPTMessage](utils.ToJson(message)) // deep copy
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
	form.Message = strings.TrimSpace(form.Message)
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
	c.SetEnableGPT4(form.GPT4)
	c.SetEnableWeb(form.Web)
	return form.Message, nil
}

func (c *Conversation) HandleMessage(db *sql.DB, data []byte) bool {
	head := len(c.Message) == 0
	msg, err := c.AddMessageFromUserForm(data)
	if err != nil {
		return false
	}
	if head {
		c.SetName(db, msg)
	}
	c.SaveConversation(db)
	return true
}

func (c *Conversation) GetLatestMessage() string {
	return c.Message[len(c.Message)-1].Content
}

func (c *Conversation) SaveResponse(db *sql.DB, message string) {
	c.AddMessageFromAssistant(message)
	c.SaveConversation(db)
}
