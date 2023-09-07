package auth

import "database/sql"

type GiftResponse struct {
	Cert     bool `json:"cert"`
	Teenager bool `json:"teenager"`
}

func NewPackage(db *sql.DB, user *User, _t string) bool {
	id := user.GetID(db)

	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM package where user_id = ? AND type = ?`, id, _t).Scan(&count); err != nil {
		return false
	}

	if count > 0 {
		return false
	}

	_ = db.QueryRow(`INSERT INTO package (user_id, type) VALUES (?, ?)`, id, _t)
	return true
}

func NewCertPackage(db *sql.DB, user *User) bool {
	res := NewPackage(db, user, "cert")
	if !res {
		return false
	}

	return user.IncreaseQuota(db, 50)
}

func NewTeenagerPackage(db *sql.DB, user *User) bool {
	res := NewPackage(db, user, "teenager")
	if !res {
		return false
	}

	return user.IncreaseQuota(db, 150)
}

func RefreshPackage(db *sql.DB, user *User) *GiftResponse {
	resp := Cert(user.Username)
	if resp == nil || resp.Status == false {
		return nil
	}

	if resp.Cert {
		NewCertPackage(db, user)
	}
	if resp.Teenager {
		NewTeenagerPackage(db, user)
	}

	return &GiftResponse{
		Cert:     resp.Cert,
		Teenager: resp.Teenager,
	}
}
