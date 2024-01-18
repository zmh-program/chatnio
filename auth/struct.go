package auth

import (
	"chat/globals"
	"database/sql"
	"time"
)

type User struct {
	ID           int64      `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
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

func GetUserByName(db *sql.DB, username string) *User {
	var user User
	if err := db.QueryRow("SELECT id, username FROM auth WHERE username = ?", username).Scan(&user.ID, &user.Username); err != nil {
		return nil
	}
	return &user
}

func GetUserByEmail(db *sql.DB, email string) *User {
	var user User
	if err := db.QueryRow("SELECT id, username FROM auth WHERE email = ?", email).Scan(&user.ID, &user.Username); err != nil {
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

func (u *User) HitID() int64 {
	return u.ID
}

func (u *User) GetEmail(db *sql.DB) string {
	if len(u.Email) > 0 {
		return u.Email
	}

	var email sql.NullString
	if err := db.QueryRow("SELECT email FROM auth WHERE username = ?", u.Username).Scan(&email); err != nil {
		return ""
	}

	u.Email = email.String
	return u.Email
}

func IsUserExist(db *sql.DB, username string) bool {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE username = ?", username).Scan(&count); err != nil {
		return false
	}
	return count > 0
}

func IsEmailExist(db *sql.DB, email string) bool {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE email = ?", email).Scan(&count); err != nil {
		return false
	}
	return count > 0
}

func getMaxBindId(db *sql.DB) int64 {
	var max int64
	if err := db.QueryRow("SELECT MAX(bind_id) FROM auth").Scan(&max); err != nil {
		return 0
	}
	return max
}

func GetGroup(db *sql.DB, user *User) string {
	if user == nil {
		return globals.AnonymousType
	}

	level := user.GetSubscriptionLevel(db)
	switch level {
	case 0:
		return globals.NormalType
	case 1:
		return globals.BasicType
	case 2:
		return globals.StandardType
	case 3:
		return globals.ProType
	default:
		return globals.NormalType
	}
}
