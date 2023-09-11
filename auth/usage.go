package auth

import (
	"database/sql"
)

// Price Calculation
// 10 nio points = ¥1
// from 2023-9-6, 1 USD = 7.3124 CNY
//
// GPT-4 price (8k-context)
// Input					Output
// $0.03 	/ 1K tokens		$0.06 	/ 1K tokens
// ￥0.21 	/ 1K tokens		￥0.43 	/ 1K tokens
// 2.1 nio 	/ 1K tokens		4.3 nio / 1K tokens

// Dalle price (512x512)
// $0.018 / per image
// ￥0.13 / per image
// 1 nio / per image

func CountInputToken(n int) float32 {
	return float32(n) / 1000 * 2.1
}

func CountOutputToken(n int) float32 {
	return float32(n) / 1000 * 4.3
}

func ReduceDalle(db *sql.DB, user *User) bool {
	if user.GetQuota(db) < 1 {
		return false
	}
	return user.UseQuota(db, 1)
}

func CanEnableGPT4(db *sql.DB, user *User) bool {
	return user.GetQuota(db) >= 5
}

func BuyQuota(db *sql.DB, user *User, quota int) bool {
	money := float32(quota) * 0.1
	if Pay(user.Username, money) {
		user.IncreaseQuota(db, float32(quota))
		return true
	}
	return false
}
