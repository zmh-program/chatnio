package utils

import (
	"encoding/json"
	"math/rand"
	"strconv"
	"time"
)

func GenerateCode(length int) string {
	var code string
	for i := 0; i < length; i++ {
		code += strconv.Itoa(rand.Intn(10))
	}
	return code
}

func GenerateChar(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}

func ConvertTime(t []uint8) *time.Time {
	val, err := time.Parse("2006-01-02 15:04:05", string(t))
	if err != nil {
		return nil
	}
	return &val
}

func Unmarshal[T interface{}](data []byte) (form T, err error) {
	err = json.Unmarshal(data, &form)
	return form, err
}

func ToInt(value string) int {
	if res, err := strconv.Atoi(value); err == nil {
		return res
	} else {
		return 0
	}
}
