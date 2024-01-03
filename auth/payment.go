package auth

import (
	"chat/utils"
	"database/sql"
	"errors"
	"github.com/go-redis/redis/v8"
	"github.com/goccy/go-json"
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
	if !useDeeptrain() {
		return 0.
	}

	order := GenerateOrder()
	res, err := utils.Post(getDeeptrainApi("/app/balance"), map[string]string{
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
	if !useDeeptrain() {
		return false
	}

	order := GenerateOrder()
	res, err := utils.Post(getDeeptrainApi("/app/payment"), map[string]string{
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

func (u *User) Pay(db *sql.DB, cache *redis.Client, amount float32) bool {
	if useDeeptrain() {
		state := Pay(u.Username, amount)
		if state {
			incrBillingRequest(cache, int64(amount*100))
		}
		return state
	}

	return u.PayedQuotaAsAmount(db, amount)
}

func BuyQuota(db *sql.DB, cache *redis.Client, user *User, quota int) error {
	money := float32(quota) * 0.1

	if !useDeeptrain() {
		return errors.New("cannot find payment provider")
	}

	if user.Pay(db, cache, money) {
		user.IncreaseQuota(db, float32(quota))
		return nil
	}

	return errors.New("do not have enough money")
}
