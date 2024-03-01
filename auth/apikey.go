package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"errors"
	"fmt"
)

func (u *User) CreateApiKey(db *sql.DB) string {
	salt := utils.Sha2Encrypt(fmt.Sprintf("%s-%s", u.Username, utils.GenerateChar(utils.GetRandomInt(720, 1024))))
	key := fmt.Sprintf("sk-%s", salt[:64]) // 64 bytes
	if _, err := globals.ExecDb(db, "INSERT INTO apikey (user_id, api_key) VALUES (?, ?)", u.GetID(db), key); err != nil {
		return ""
	}
	return key
}

func (u *User) GetApiKey(db *sql.DB) string {
	var key string
	if err := globals.QueryRowDb(db, "SELECT api_key FROM apikey WHERE user_id = ?", u.GetID(db)).Scan(&key); err != nil {
		return u.CreateApiKey(db)
	}
	return key
}

func (u *User) ResetApiKey(db *sql.DB) (string, error) {
	if _, err := globals.ExecDb(db, "DELETE FROM apikey WHERE user_id = ?", u.GetID(db)); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return "", err
	}
	return u.CreateApiKey(db), nil
}
