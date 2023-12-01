package utils

import (
	"fmt"
	"github.com/goccy/go-json"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func GetRandomInt(min int, max int) int {
	return Intn(max-min) + min
}

func GenerateCode(length int) string {
	var code string
	for i := 0; i < length; i++ {
		code += strconv.Itoa(Intn(10))
	}
	return code
}

func GenerateChar(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = charset[Intn(len(charset))]
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

func UnmarshalForm[T interface{}](data string) *T {
	form, err := Unmarshal[T]([]byte(data))
	if err != nil {
		return nil
	}
	return &form
}

func Marshal[T interface{}](data T) string {
	res, err := json.Marshal(data)
	if err != nil {
		return ""
	}
	return string(res)
}

func MapToStruct[T any](data interface{}) *T {
	val := Marshal(data)
	if form, err := Unmarshal[T]([]byte(val)); err == nil {
		return &form
	} else {
		return nil
	}
}

func ParseInt(value string) int {
	if res, err := strconv.Atoi(value); err == nil {
		return res
	} else {
		return 0
	}
}

func ConvertSqlTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

func GetImageMarkdown(url string) string {
	return fmt.Sprintf("![image](%s)", url)
}

// SplitItem is the split function for strings.Split
// e.g.
// SplitItem("a,b,c", ",") => ["a,", "b,", "c"]
func SplitItem(data string, sep string) []string {
	if data == "" {
		return []string{}
	}

	result := strings.Split(data, sep)
	length := len(result)
	for i, item := range result {
		if i == length-1 {
			break
		}
		result[i] = item + sep
	}
	return result
}

func SplitItems(data string, seps []string) []string {
	if len(seps) == 0 {
		return []string{}
	}

	result := []string{data}
	for _, sep := range seps {
		var temp []string
		for _, item := range result {
			temp = append(temp, SplitItem(item, sep)...)
		}
		result = temp
	}
	return result
}

func SplitLangItems(data string) []string {
	return SplitItems(data, []string{",", "，", " ", "\n"})
}

func Extract(data string, length int, flow string) string {
	value := []rune(data)
	if len(value) > length {
		return string(value[:length]) + flow
	} else {
		return data
	}
}

func ExtractUrls(data string) []string {
	re := regexp.MustCompile(`(https?://\S+)`)
	return re.FindAllString(data, -1)
}

func ExtractImageUrls(data string) []string {
	// https://platform.openai.com/docs/guides/vision/what-type-of-files-can-i-upload

	re := regexp.MustCompile(`(https?://\S+\.(?:png|jpg|jpeg|gif|webp))`)
	return re.FindAllString(data, -1)
}
