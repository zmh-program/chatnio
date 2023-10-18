package conversation

import (
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"database/sql"
	"strconv"
	"strings"
	"time"
)

type SharedForm struct {
	Username string            `json:"username"`
	Name     string            `json:"name"`
	Messages []globals.Message `json:"messages"`
	Time     time.Time         `json:"time"`
}

type SharedHashForm struct {
	Id             int64 `json:"id"`
	ConversationId int64 `json:"conversation_id"`
	Refs           []int `json:"refs"`
}

func GetRef(refs []int) (result string) {
	for _, v := range refs {
		result += strconv.Itoa(v) + ","
	}
	return strings.TrimSuffix(result, ",")
}

func (c *Conversation) ShareConversation(db *sql.DB, user *auth.User, refs []int) bool {
	if c.GetId() < 0 || user == nil {
		return false
	}

	ref := GetRef(refs)
	hash := utils.Md5EncryptForm(SharedHashForm{
		Id:             c.GetId(),
		ConversationId: c.GetId(),
		Refs:           refs,
	})

	_, err := db.Exec(`
		INSERT INTO sharing (hash, user_id, conversation_id, refs) VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE refs = ?
	`, hash, user.GetID(db), c.GetId(), ref, ref)

	return err == nil
}

func GetSharedMessages(db *sql.DB, userId int64, conversationId int64, refs []string) []globals.Message {
	conversation := LoadConversation(db, userId, conversationId)
	if conversation == nil {
		return nil
	}

	messages := make([]globals.Message, 0)
	for _, v := range refs {
		if v == "-1" {
			return conversation.GetMessage()
		} else {
			id, err := strconv.Atoi(v)
			if err != nil {
				continue
			}
			messages = append(messages, conversation.GetMessageById(id))
		}
	}
	return messages
}

func GetSharedConversation(db *sql.DB, hash string) (*SharedForm, error) {
	var shared SharedForm
	var (
		uid     int64
		cid     int64
		ref     string
		updated []uint8
	)
	if err := db.QueryRow(`
		SELECT auth.username, sharing.refs, sharing.updated_at, conversation.conversation_name,
		       sharing.user_id, sharing.conversation_id
		FROM sharing
		INNER JOIN auth ON auth.id = sharing.user_id
		INNER JOIN conversation ON conversation.id = sharing.conversation_id
		WHERE sharing.hash = ?
	`, hash).Scan(&shared.Username, &ref, &updated, &shared.Name, &uid, &cid); err != nil {
		return nil, err
	}

	shared.Time = *utils.ConvertTime(updated)
	refs := strings.Split(ref, ",")
	shared.Messages = GetSharedMessages(db, uid, cid, refs)

	return &shared, nil
}
