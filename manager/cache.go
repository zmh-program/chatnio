package manager

import (
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"time"
)

type CacheProps struct {
	Message    []globals.Message `json:"message" required:"true"`
	Model      string            `json:"model" required:"true"`
	Reversible bool              `json:"reversible"`
}

type CacheData struct {
	Message string `json:"message"`
}

func ExtractCacheData(c *gin.Context, props *CacheProps) *CacheData {
	hash := utils.Md5Encrypt(utils.Marshal(props))
	data, err := utils.GetCacheFromContext(c).Get(c, fmt.Sprintf(":niodata:%s", hash)).Result()
	if err == nil && data != "" {
		return utils.UnmarshalForm[CacheData](data)
	}
	return nil
}

func SaveCacheData(c *gin.Context, props *CacheProps, data *CacheData) {
	if channel.ChargeInstance.IsBilling(props.Model) {
		return
	}

	hash := utils.Md5Encrypt(utils.Marshal(props))
	utils.GetCacheFromContext(c).Set(c, fmt.Sprintf(":niodata:%s", hash), utils.Marshal(data), time.Hour*12)
}
