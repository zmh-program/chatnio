package conversation

import (
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"database/sql"
	"fmt"
)

func (c *Conversation) SaveConversation(db *sql.DB) bool {
	if c.UserID == -1 {
		// anonymous request
		return true
	}

	data := utils.ToJson(c.GetMessage())
	query := `
		INSERT INTO conversation (user_id, conversation_id, conversation_name, data, model) VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE conversation_name = VALUES(conversation_name), data = VALUES(data)
	`

	stmt, err := globals.PrepareDb(db, query)
	if err != nil {
		return false
	}
	defer func(stmt *sql.Stmt) {
		err := stmt.Close()
		if err != nil {
			globals.Warn(err)
		}
	}(stmt)

	_, err = stmt.Exec(c.UserID, c.Id, c.Name, data, c.Model)
	if err != nil {
		globals.Info(fmt.Sprintf("execute error during save conversation: %s", err.Error()))
		return false
	}
	return true
}
func GetConversationLengthByUserID(db *sql.DB, userId int64) int64 {
	var length int64
	err := globals.QueryRowDb(db, "SELECT MAX(conversation_id) FROM conversation WHERE user_id = ?", userId).Scan(&length)
	if err != nil || length < 0 {
		return 0
	}
	return length
}

func LoadConversation(db *sql.DB, userId int64, conversationId int64) *Conversation {
	conversation := Conversation{
		UserID: userId,
		Id:     conversationId,
	}

	var (
		data  string
		model interface{}
	)
	err := globals.QueryRowDb(db, `
		SELECT conversation_name, model, data FROM conversation
		WHERE user_id = ? AND conversation_id = ?
		`, userId, conversationId).Scan(&conversation.Name, &model, &data)
	if value, ok := model.([]byte); ok {
		conversation.Model = string(value)
	} else {
		conversation.Model = globals.GPT3Turbo
	}

	if err != nil {
		return nil
	}

	conversation.Message, err = utils.Unmarshal[[]globals.Message]([]byte(data))
	if err != nil {
		return nil
	}

	return &conversation
}

func LoadConversationList(db *sql.DB, userId int64) []Conversation {
	var conversationList []Conversation
	rows, err := globals.QueryDb(db, `
			SELECT conversation_id, conversation_name FROM conversation WHERE user_id = ? 
			ORDER BY conversation_id DESC LIMIT 100
	`, userId)
	if err != nil {
		return conversationList
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			return
		}
	}(rows)

	for rows.Next() {
		var conversation Conversation
		err := rows.Scan(&conversation.Id, &conversation.Name)
		if err != nil {
			continue
		}
		conversationList = append(conversationList, conversation)
	}

	return conversationList
}

func (c *Conversation) DeleteConversation(db *sql.DB) bool {
	_, err := globals.ExecDb(db, "DELETE FROM conversation WHERE user_id = ? AND conversation_id = ?", c.UserID, c.Id)
	if err != nil {
		return false
	}
	return true
}

func (c *Conversation) RenameConversation(db *sql.DB, name string) bool {
	_, err := globals.ExecDb(db, "UPDATE conversation SET conversation_name = ? WHERE user_id = ? AND conversation_id = ?", name, c.UserID, c.Id)
	if err != nil {
		return false
	}
	return true
}

func DeleteAllConversations(db *sql.DB, user auth.User) error {
	_, err := globals.ExecDb(db, "DELETE FROM conversation WHERE user_id = ?", user.GetID(db))
	return err
}
