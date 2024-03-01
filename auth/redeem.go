package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
)

type Redeem struct {
	Id    int64   `json:"id"`
	Code  string  `json:"code"`
	Quota float32 `json:"quota"`
	Used  bool    `json:"used"`
}

func GenerateRedeemCodes(db *sql.DB, num int, quota float32) ([]string, error) {
	arr := make([]string, 0)
	idx := 0
	for idx < num {
		code := fmt.Sprintf("nio-%s", utils.GenerateChar(32))
		if err := CreateRedeemCode(db, code, quota); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return nil, fmt.Errorf("failed to generate code: %w", err)
		}
		arr = append(arr, code)
		idx++
	}

	return arr, nil
}

func CreateRedeemCode(db *sql.DB, code string, quota float32) error {
	_, err := globals.ExecDb(db, `
		INSERT INTO redeem (code, quota) VALUES (?, ?)
	`, code, quota)
	return err
}

func GetRedeemCode(db *sql.DB, code string) (*Redeem, error) {
	row := globals.QueryRowDb(db, `
		SELECT id, code, quota, used
		FROM redeem
		WHERE code = ?
	`, code)
	var redeem Redeem
	err := row.Scan(&redeem.Id, &redeem.Code, &redeem.Quota, &redeem.Used)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("redeem code not found")
		}
		return nil, fmt.Errorf("failed to get redeem code: %w", err)
	}
	return &redeem, nil
}
func (r *Redeem) IsUsed() bool {
	return r.Used
}

func (r *Redeem) Use(db *sql.DB) error {
	_, err := globals.ExecDb(db, `
		UPDATE redeem SET used = TRUE WHERE id = ? AND used = FALSE
	`, r.Id)
	return err
}

func (r *Redeem) GetQuota() float32 {
	return r.Quota
}

func (r *Redeem) UseRedeem(db *sql.DB, user *User) error {
	if r.IsUsed() {
		return fmt.Errorf("this redeem code has been used")
	}

	if err := r.Use(db); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("redeem code not found")
		} else if errors.Is(err, sql.ErrTxDone) {
			return fmt.Errorf("transaction has been closed")
		}
		return fmt.Errorf("failed to use redeem code: %w", err)
	}

	if !user.IncreaseQuota(db, r.GetQuota()) {
		return fmt.Errorf("failed to increase quota for user")
	}

	return nil
}

func (u *User) UseRedeem(db *sql.DB, cache *redis.Client, code string) (float32, error) {
	if useDeeptrain() {
		return 0, errors.New("redeem code is not available in deeptrain mode")
	}

	if redeem, err := GetRedeemCode(db, code); err != nil {
		return 0, err
	} else {
		if err := redeem.UseRedeem(db, u); err != nil {
			return 0, fmt.Errorf("failed to use redeem code: %w", err)
		}

		incrBillingRequest(cache, int64(redeem.GetQuota()*10))
		return redeem.GetQuota(), nil
	}
}
