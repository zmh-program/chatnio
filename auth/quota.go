package auth

import (
	"chat/channel"
	"chat/globals"
	"database/sql"
)

func (u *User) CreateInitialQuota(db *sql.DB) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?)
	`, u.GetID(db), channel.SystemInstance.GetInitialQuota(), 0.)
	return err == nil
}

func (u *User) GetQuota(db *sql.DB) float32 {
	var quota float32
	if err := globals.QueryRowDb(db, "SELECT quota FROM quota WHERE user_id = ?", u.GetID(db)).Scan(&quota); err != nil {
		return 0.
	}
	return quota
}

func (u *User) GetUsedQuota(db *sql.DB) float32 {
	var quota float32
	if err := globals.QueryRowDb(db, "SELECT used FROM quota WHERE user_id = ?", u.GetID(db)).Scan(&quota); err != nil {
		return 0.
	}
	return quota
}

func (u *User) SetQuota(db *sql.DB, quota float32) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = ?
	`, u.GetID(db), quota, 0., quota)
	return err == nil
}

func (u *User) SetUsedQuota(db *sql.DB, used float32) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE used = ?
	`, u.GetID(db), 0., used, used)
	return err == nil
}

func (u *User) IncreaseQuota(db *sql.DB, quota float32) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = quota + ?
	`, u.GetID(db), quota, 0., quota)
	return err == nil
}

func (u *User) IncreaseUsedQuota(db *sql.DB, used float32) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE used = used + ?
	`, u.GetID(db), 0., used, used)
	return err == nil
}

func (u *User) DecreaseQuota(db *sql.DB, quota float32) bool {
	_, err := globals.ExecDb(db, `
		INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = quota - ?
	`, u.GetID(db), quota, 0., quota)
	return err == nil
}

func (u *User) UseQuota(db *sql.DB, quota float32) bool {
	if quota == 0 {
		return true
	}
	if !u.DecreaseQuota(db, quota) {
		return false
	}
	return u.IncreaseUsedQuota(db, quota)
}

func (u *User) PayedQuota(db *sql.DB, quota float32) bool {
	if quota == 0 {
		return true
	}

	current := u.GetQuota(db)
	if quota > current {
		return false
	}

	if !u.DecreaseQuota(db, quota) {
		return false
	}
	return u.IncreaseUsedQuota(db, quota)
}

func (u *User) PayedQuotaAsAmount(db *sql.DB, amount float32) bool {
	return u.PayedQuota(db, amount*10)
}
