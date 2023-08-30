package auth

import (
	"database/sql"
)

func ReduceUsage(db *sql.DB, user *User, _t string) bool {
	id := user.GetID(db)
	var count int
	if err := db.QueryRow(`SELECT balance FROM usages where user_id = ? AND type = ?`, id, _t).Scan(&count); err != nil {
		count = 0
	}

	if count <= 0 {
		return false
	}

	if _, err := db.Exec(`UPDATE usages SET balance = ? WHERE user_id = ? AND type = ?`, count-1, id, _t); err != nil {
		return false
	}

	return true
}

func ReduceDalle(db *sql.DB, user *User) bool {
	return ReduceUsage(db, user, "dalle")
}

func ReduceGPT4(db *sql.DB, user *User) bool {
	return ReduceUsage(db, user, "gpt4")
}

func IncreaseUsage(db *sql.DB, user *User, _t string, value int) {
	id := user.GetID(db)
	var count int
	if err := db.QueryRow(`SELECT balance FROM usages where user_id = ? AND type = ?`, id, _t).Scan(&count); err != nil {
		count = 0
	}

	_ = db.QueryRow(`INSERT INTO usages (user_id, type, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = ?`, id, _t, count+value, count+value).Scan()
}

func IncreaseDalle(db *sql.DB, user *User, value int) {
	IncreaseUsage(db, user, "dalle", value)
}

func IncreaseGPT4(db *sql.DB, user *User, value int) {
	IncreaseUsage(db, user, "gpt4", value)
}

func GetUsage(db *sql.DB, user *User, _t string) int {
	id := user.GetID(db)
	var count int
	if err := db.QueryRow(`SELECT balance FROM usages where user_id = ? AND type = ?`, id, _t).Scan(&count); err != nil {
		return 0
	}
	return count
}

func GetDalleUsage(db *sql.DB, user *User) int {
	return GetUsage(db, user, "dalle")
}

func GetGPT4Usage(db *sql.DB, user *User) int {
	return GetUsage(db, user, "gpt4")
}

func UsageAPI(db *sql.DB, user *User) map[string]int {
	return map[string]int{
		"dalle": GetDalleUsage(db, user),
		"gpt4":  GetGPT4Usage(db, user),
	}
}

func BuyDalle(db *sql.DB, user *User, value int) bool {
	// 1 dalle usage = ¥0.1
	if !Pay(user.Username, float32(value)*0.1) {
		return false
	}

	IncreaseDalle(db, user, value)
	return true
}

func CountGPT4Prize(value int) float32 {
	if value <= 20 {
		return float32(value) * 0.5
	}

	return 20*0.5 + float32(value-20)*0.4
}

func BuyGPT4(db *sql.DB, user *User, value int) bool {
	if !Pay(user.Username, CountGPT4Prize(value)) {
		return false
	}

	IncreaseGPT4(db, user, value)
	return true
}
