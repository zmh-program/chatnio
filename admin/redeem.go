package admin

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"fmt"
	"strings"
)

func GetRedeemData(db *sql.DB) []RedeemData {
	var data []RedeemData

	rows, err := globals.QueryDb(db, `
		SELECT quota, COUNT(*) AS total, SUM(IF(used = 0, 0, 1)) AS used
		FROM redeem
		GROUP BY quota
	`)
	if err != nil {
		return data
	}

	for rows.Next() {
		var d RedeemData
		if err := rows.Scan(&d.Quota, &d.Total, &d.Used); err != nil {
			return data
		}
		data = append(data, d)
	}

	return data
}

func GetRedeemSegment(db *sql.DB, quota float32, onlyUnused bool) ([]string, error) {
	var codes []string
	var rows *sql.Rows
	var err error

	if onlyUnused {
		rows, err = globals.QueryDb(db, `
			SELECT code FROM redeem WHERE quota = ? AND used = 0
		`, quota)
	} else {
		rows, err = globals.QueryDb(db, `
			SELECT code FROM redeem WHERE quota = ?
		`, quota)
	}

	if err != nil {
		return codes, err
	}

	for rows.Next() {
		var code string
		if err := rows.Scan(&code); err != nil {
			return codes, err
		}
		codes = append(codes, code)
	}

	return codes, nil
}

func GenerateRedeemCodes(db *sql.DB, num int, quota float32) RedeemGenerateResponse {
	arr := make([]string, 0)
	idx := 0
	for idx < num {
		code, err := CreateRedeemCode(db, quota)

		if err != nil {
			return RedeemGenerateResponse{
				Status:  false,
				Message: err.Error(),
			}
		}
		arr = append(arr, code)
		idx++
	}

	return RedeemGenerateResponse{
		Status: true,
		Data:   arr,
	}
}

func CreateRedeemCode(db *sql.DB, quota float32) (string, error) {
	code := fmt.Sprintf("nio-%s", utils.GenerateChar(32))
	_, err := globals.ExecDb(db, `
		INSERT INTO redeem (code, quota) VALUES (?, ?)
	`, code, quota)

	if err != nil && strings.Contains(err.Error(), "Duplicate entry") {
		// code name is duplicate
		return CreateRedeemCode(db, quota)
	}

	return code, err
}
