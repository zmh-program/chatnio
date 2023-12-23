package auth

import (
	"chat/utils"
	"github.com/goccy/go-json"
	"github.com/spf13/viper"
)

type ValidateUserResponse struct {
	Status   bool   `json:"status" required:"true"`
	Username string `json:"username" required:"true"`
	ID       int    `json:"id" required:"true"`
}

func getDeeptrainApi(path string) string {
	return viper.GetString("auth.endpoint") + path
}

func useDeeptrain() bool {
	return viper.GetBool("auth.use_deeptrain")
}

func Validate(token string) *ValidateUserResponse {
	res, err := utils.Post(getDeeptrainApi("/app/validate"), map[string]string{
		"Content-Type": "application/json",
	}, map[string]interface{}{
		"password": viper.GetString("auth.access"),
		"token":    token,
		"hash":     utils.Sha2Encrypt(token + viper.GetString("auth.salt")),
	})

	if err != nil || res == nil || res.(map[string]interface{})["status"] == false {
		return nil
	}

	converter, _ := json.Marshal(res)
	resp, _ := utils.Unmarshal[ValidateUserResponse](converter)
	return &resp
}
