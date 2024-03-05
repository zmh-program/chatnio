package conversation

import (
	"chat/auth"
	"chat/globals"
	"chat/utils"
	"database/sql"
)

type Mask struct {
	Id          int               `json:"id"`
	Avatar      string            `json:"avatar"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Context     []globals.Message `json:"context"`
}

func (c *Conversation) LoadMask(data string) {
	message := utils.UnmarshalForm[[]globals.Message](data)
	if message != nil && len(*message) > 0 {
		c.InsertMessages(*message, 0)
	}
}

func (m *Mask) Save(db *sql.DB, user *auth.User) error {
	userId := user.GetID(db)

	if m.Id == -1 {
		_, err := globals.ExecDb(db,
			"INSERT INTO mask (mask.user_id, avatar, name, description, context) VALUES (?, ?, ?, ?, ?)",
			userId, m.Avatar, m.Name, m.Description, utils.Marshal(m.Context),
		)
		return err
	}

	_, err := globals.ExecDb(db,
		"UPDATE mask SET avatar = ?, name = ?, description = ?, context = ? WHERE id = ? AND user_id = ?",
		m.Avatar, m.Name, m.Description, utils.Marshal(m.Context), m.Id, userId,
	)
	return err
}

func (m *Mask) Delete(db *sql.DB, user *auth.User) error {
	_, err := globals.ExecDb(db, "DELETE FROM mask WHERE id = ? AND user_id = ?", m.Id, user.GetID(db))
	return err
}

func LoadMask(db *sql.DB, user *auth.User) ([]Mask, error) {
	rows, err := globals.QueryDb(db, `
		SELECT id, avatar, name, description, context 
		FROM mask WHERE user_id = ?
		ORDER BY id DESC
	`, user.GetID(db))
	if err != nil {
		return nil, err
	}

	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			globals.Warn(err.Error())
		}
	}(rows)

	masks := make([]Mask, 0)
	for rows.Next() {
		var mask Mask
		var context string

		err = rows.Scan(&mask.Id, &mask.Avatar, &mask.Name, &mask.Description, &context)
		if err != nil {
			return nil, err
		}

		data, err := utils.UnmarshalString[[]globals.Message](context)
		if err != nil {
			return nil, err
		}

		mask.Context = data

		masks = append(masks, mask)
	}

	return masks, nil
}
