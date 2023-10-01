package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"encoding/json"
	"github.com/spf13/viper"
)

type BalanceResponse struct {
	Status  bool    `json:"status" required:"true"`
	Balance float32 `json:"balance"`
}

type PaymentResponse struct {
	Status bool `json:"status" required:"true"`
	Type   bool `json:"type"`
}

func GenerateOrder() string {
	return utils.Sha2Encrypt(utils.GenerateChar(32))
}

func GetBalance(username string) float32 {
	order := GenerateOrder()
	res, err := utils.Post("https://api.deeptrain.net/app/balance", map[string]string{
		"Content-Type": "application/json",
	}, map[string]interface{}{
		"password": viper.GetString("auth.access"),
		"user":     username,
		"hash":     utils.Sha2Encrypt(username + viper.GetString("auth.salt")),
		"order":    order,
		"sign":     utils.Sha2Encrypt(username + order + viper.GetString("auth.sign")),
	})

	if err != nil || res == nil || res.(map[string]interface{})["status"] == false {
		return 0.
	}

	converter, _ := json.Marshal(res)
	resp, _ := utils.Unmarshal[BalanceResponse](converter)
	return resp.Balance
}

func Pay(username string, amount float32) bool {
	order := GenerateOrder()
	res, err := utils.Post("https://api.deeptrain.net/app/payment", map[string]string{
		"Content-Type": "application/json",
	}, map[string]interface{}{
		"password": viper.GetString("auth.access"),
		"user":     username,
		"hash":     utils.Sha2Encrypt(username + viper.GetString("auth.salt")),
		"order":    order,
		"amount":   amount,
		"sign":     utils.Sha2Encrypt(username + order + viper.GetString("auth.sign")),
	})

	if err != nil || res == nil || res.(map[string]interface{})["status"] == false {
		return false
	}

	converter, _ := json.Marshal(res)
	resp, _ := utils.Unmarshal[PaymentResponse](converter)
	return resp.Type
}

func ReduceDalle(db *sql.DB, user *User) bool {
	if user.GetQuota(db) < 1 {
		return false
	}
	return user.UseQuota(db, 1)
}

func CanEnableModel(db *sql.DB, user *User, model string) bool {
	switch model {
	case globals.GPT4, globals.GPT40613, globals.GPT40314:
		return user != nil && user.GetQuota(db) >= 5
	case globals.GPT432k, globals.GPT432k0613, globals.GPT432k0314:
		return user != nil && user.GetQuota(db) >= 50
	case globals.SparkDesk:
		return user != nil && user.GetQuota(db) >= 1
	case globals.Claude2100k:
		return user != nil && user.GetQuota(db) >= 1
	default:
		return true
	}
}

func CanEnableModelWithSubscription(db *sql.DB, user *User, model string, useReverse bool) bool {
	if utils.Contains(model, globals.GPT4Array) {
		if useReverse {
			return true
		}
	}
	return CanEnableModel(db, user, model)
}

func BuyQuota(db *sql.DB, user *User, quota int) bool {
	money := float32(quota) * 0.1
	if Pay(user.Username, money) {
		user.IncreaseQuota(db, float32(quota))
		return true
	}
	return false
}
