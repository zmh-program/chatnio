package admin

import (
	"database/sql"
	"math"
)

func GetUserPagination(db *sql.DB, page int64, search string) PaginationForm {
	// if search is empty, then search all users

	var users []interface{}
	var total int64

	if err := db.QueryRow(`
		SELECT COUNT(*) FROM auth
		WHERE username LIKE ?
	`, "%"+search+"%").Scan(&total); err != nil {
		return PaginationForm{
			Status:  false,
			Message: err.Error(),
		}
	}

	rows, err := db.Query(`
		SELECT 
		    auth.id, auth.username, auth.is_admin,
		    quota.quota, quota.used,
		    subscription.expired_at, subscription.total_month, subscription.enterprise
		FROM auth
		LEFT JOIN quota ON quota.user_id = auth.id
		LEFT JOIN subscription ON subscription.user_id = auth.id
		WHERE auth.username LIKE ?
		ORDER BY auth.id DESC LIMIT ? OFFSET ?
	`, "%"+search+"%", pagination, page*pagination)
	if err != nil {
		return PaginationForm{
			Status:  false,
			Message: err.Error(),
		}
	}

	for rows.Next() {
		var user UserData
		if err := rows.Scan(&user.Id, &user.Username, &user.IsAdmin); err != nil {
			return PaginationForm{
				Status:  false,
				Message: err.Error(),
			}
		}
		users = append(users, user)
	}

	return PaginationForm{
		Status: true,
		Total:  int(math.Ceil(float64(total) / float64(pagination))),
		Data:   users,
	}
}
