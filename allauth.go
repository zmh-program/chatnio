package main

import (
	"encoding/json"
	"github.com/spf13/viper"
)

type ValidateUserResponse struct {
	Status   bool   `json:"status" required:"true"`
	Username string `json:"username" required:"true"`
	ID       int    `json:"id" required:"true"`
}

func Validate(token string) *ValidateUserResponse {
	res, err := Post("https://api.deeptrain.net/app/validate", map[string]string{
		"Content-Type": "application/json",
	}, map[string]interface{}{
		"password": viper.GetString("auth.access"),
		"token":    token,
		"hash":     Sha2Encrypt(token + viper.GetString("auth.salt")),
	})

	if err != nil || res == nil || res.(map[string]interface{})["status"] == false {
		return nil
	}

	converter, _ := json.Marshal(res)
	var response ValidateUserResponse
	_ = json.Unmarshal(converter, &response)
	return &response
}
