package admin

import (
	"chat/utils"
	"database/sql"
	"errors"
	"fmt"
	"math"
)

func GetInvitationPagination(db *sql.DB, page int64) PaginationForm {
	var invitations []interface{}
	var total int64
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM invitation
	`).Scan(&total); err != nil {
		return PaginationForm{
			Status:  false,
			Message: err.Error(),
		}
	}

	rows, err := db.Query(`
		SELECT code, quota, type, used, updated_at FROM invitation
		ORDER BY id DESC LIMIT ? OFFSET ?
	`, pagination, page*pagination)
	if err != nil {
		return PaginationForm{
			Status:  false,
			Message: err.Error(),
		}
	}

	for rows.Next() {
		var invitation InvitationData
		var date []uint8
		if err := rows.Scan(&invitation.Code, &invitation.Quota, &invitation.Type, &invitation.Used, &date); err != nil {
			return PaginationForm{
				Status:  false,
				Message: err.Error(),
			}
		}
		invitation.UpdatedAt = utils.ConvertTime(date).Format("2006-01-02 15:04:05")
		invitations = append(invitations, invitation)
	}

	return PaginationForm{
		Status: true,
		Total:  int(math.Ceil(float64(total) / float64(pagination))),
		Data:   invitations,
	}
}

func NewInvitationCode(db *sql.DB, code string, quota float32, t string) error {
	_, err := db.Exec(`
		INSERT INTO invitation (code, quota, type)
		VALUES (?, ?, ?)
	`, code, quota, t)
	return err
}

func GenerateInvitations(db *sql.DB, num int, quota float32, t string) InvitationGenerateResponse {
	arr := make([]string, 0)
	idx := 0
	for idx < num {
		code := fmt.Sprintf("%s-%s", t, utils.GenerateChar(24))
		if err := NewInvitationCode(db, code, quota, t); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return InvitationGenerateResponse{
				Status:  false,
				Message: err.Error(),
			}
		}
		arr = append(arr, code)
		idx++
	}

	return InvitationGenerateResponse{
		Status: true,
		Data:   arr,
	}
}
