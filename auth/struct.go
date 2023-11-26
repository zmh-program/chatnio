package auth

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int64      `json:"id"`
	Username     string     `json:"username"`
	BindID       int64      `json:"bind_id"`
	Password     string     `json:"password"`
	Token        string     `json:"token"`
	Admin        bool       `json:"is_admin"`
	Level        int        `json:"level"`
	Subscription *time.Time `json:"subscription"`
}

func GetUserById(db *sql.DB, id int64) *User {
	var user User
	if err := db.QueryRow("SELECT id, username FROM auth WHERE id = ?", id).Scan(&user.ID, &user.Username); err != nil {
		return nil
	}
	return &user
}

func GetId(db *sql.DB, user *User) int64 {
	if user == nil {
		return -1
	}
	return user.GetID(db)
}

func (u *User) IsAdmin(db *sql.DB) bool {
	if u.Admin {
		return true
	}

	var admin sql.NullBool
	if err := db.QueryRow("SELECT is_admin FROM auth WHERE username = ?", u.Username).Scan(&admin); err != nil {
		return false
	}

	u.Admin = admin.Valid && admin.Bool
	return u.Admin
}

func (u *User) GetID(db *sql.DB) int64 {
	if u.ID > 0 {
		return u.ID
	}
	if err := db.QueryRow("SELECT id FROM auth WHERE username = ?", u.Username).Scan(&u.ID); err != nil {
		return 0
	}
	return u.ID
}

func IsUserExist(db *sql.DB, username string) bool {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE username = ?", username).Scan(&count); err != nil {
		return false
	}
	return count > 0
}
