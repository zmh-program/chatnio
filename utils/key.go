package utils

import (
	"math/rand"
	"strings"
)

func GetRandomKey(apikey string) string {
	arr := strings.Split(apikey, "|")
	idx := rand.Intn(len(arr))
	return arr[idx]
}
