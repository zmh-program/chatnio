package utils

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/goccy/go-json"
	"github.com/spf13/viper"
)

func Intn(n int) int {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	return r.Intn(n)
}

func Intn64(n int64) int64 {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	return r.Int63n(n)
}

func IntnSeed(n int, seed int) int {
	// unix nano is the same if called in the same nanosecond, so we need to add another random seed
	source := rand.NewSource(time.Now().UnixNano() + int64(seed))
	r := rand.New(source)
	return r.Intn(n)
}

func IntnSeq(n int, len int) (res []int) {
	for i := 0; i < len; i++ {
		res = append(res, IntnSeed(n, i))
	}

	return res
}

func Sum[T int | int64 | float32 | float64](arr []T) T {
	var res T
	for _, v := range arr {
		res += v
	}
	return res
}

func Contains[T comparable](value T, slice []T) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

func ToPtr[T any](value T) *T {
	return &value
}

func TryGet[T any](arr []T, index int) T {
	if index >= len(arr) {
		return arr[0]
	}
	return arr[index]
}

func Debug[T any](v T) T {
	fmt.Println(v)
	return v
}

func Insert[T any](arr []T, index int, value T) []T {
	arr = append(arr, value)
	copy(arr[index+1:], arr[index:])
	arr[index] = value
	return arr
}

func InsertSlice[T any](arr []T, index int, value []T) []T {
	arr = append(arr, value...)
	copy(arr[index+len(value):], arr[index:])
	copy(arr[index:], value)
	return arr
}

func Collect[T any](arr ...[]T) []T {
	res := make([]T, 0)

	for _, v := range arr {
		res = append(res, v...)
	}
	return res
}

func Append[T any](arr []T, value T) []T {
	return append(arr, value)
}

func AppendSlice[T any](arr []T, value []T) []T {
	return append(arr, value...)
}

func Prepend[T any](arr []T, value T) []T {
	return append([]T{value}, arr...)
}

func PrependSlice[T any](arr []T, value []T) []T {
	return append(value, arr...)
}

func Remove[T any](arr []T, index int) []T {
	return append(arr[:index], arr[index+1:]...)
}

func RemoveSlice[T any](arr []T, index int, length int) []T {
	return append(arr[:index], arr[index+length:]...)
}

func ToJson(value interface{}) string {
	if res, err := json.Marshal(value); err == nil {
		return string(res)
	} else {
		return "{}"
	}
}

func UnmarshalJson[T any](value string) T {
	var res T
	if err := json.Unmarshal([]byte(value), &res); err == nil {
		return res
	} else {
		return res
	}
}

func DeepCopy[T any](value T) T {
	return UnmarshalJson[T](ToJson(value))
}

func GetSegment[T any](arr []T, length int) []T {
	if length > len(arr) {
		return arr
	}
	return arr[:length]
}

func GetSegmentString(arr string, length int) string {
	if length > len(arr) {
		return arr
	}
	return arr[:length]
}

func GetLatestSegment[T any](arr []T, length int) []T {
	if length > len(arr) {
		return arr
	}
	return arr[len(arr)-length:]
}

func Reverse[T any](arr []T) []T {
	for i := 0; i < len(arr)/2; i++ {
		arr[i], arr[len(arr)-i-1] = arr[len(arr)-i-1], arr[i]
	}
	return arr
}

func Multi[T comparable](condition bool, tval, fval T) T {
	if condition {
		return tval
	} else {
		return fval
	}
}

func MultiF[T comparable](condition bool, tval func() T, fval T) T {
	if condition {
		return tval()
	} else {
		return fval
	}
}

func InsertChannel[T any](ch chan T, value T, index int) {
	var arr []T
	for i := 0; i < len(ch); i++ {
		arr = append(arr, <-ch)
	}
	arr = Insert(arr, index, value)
	for _, v := range arr {
		ch <- v
	}
}

func Sort[T any](arr []T, compare func(a, b T) bool) []T {
	if len(arr) <= 1 {
		return arr
	}

	var result []T
	var temp []T
	var hasFirst bool
	var first T

	for _, item := range arr {
		if !hasFirst {
			first = item
			hasFirst = true
			continue
		}

		if compare(item, first) {
			temp = append(temp, item)
		} else {
			result = append(result, first)
			result = append(result, Sort(temp, compare)...)
			first = item
			temp = []T{}
		}
	}

	if len(temp) > 0 {
		result = append(result, first)
		result = append(result, Sort(temp, compare)...)
	} else if hasFirst {
		result = append(result, first)
	}

	return result
}

func Each[T any, U any](arr []T, f func(T) U) []U {
	var res []U
	for _, v := range arr {
		res = append(res, f(v))
	}
	return res
}

func EachObject[T any, V any](arr []T, f func(T) (string, V)) map[string]V {
	res := make(map[string]V)
	for _, v := range arr {
		key, val := f(v)
		res[key] = val
	}
	return res
}

func EachNotNil[T any, U any](arr []T, f func(T) *U) []U {
	var res []U
	for _, v := range arr {
		if val := f(v); val != nil {
			res = append(res, *val)
		}
	}
	return res
}

func Filter[T any](arr []T, f func(T) bool) []T {
	var res []T
	for _, v := range arr {
		if f(v) {
			res = append(res, v)
		}
	}
	return res
}

func Sleep(ms int) {
	time.Sleep(time.Duration(ms) * time.Millisecond)
}

func GetPtrVal[T any](ptr *T, def T) T {
	if ptr == nil {
		return def
	}
	return *ptr
}

func LimitMax[T int | int64 | float32 | float64](value T, max T) T {
	if value > max {
		return max
	}
	return value
}

func LimitMin[T int | int64 | float32 | float64](value T, min T) T {
	if value < min {
		return min
	}
	return value
}

func InRange[T int | int64 | float32 | float64](value T, min T, max T) bool {
	return value >= min && value <= max
}

func GetError(err error) string {
	if err != nil {
		return err.Error()
	}
	return ""
}

func GetIndexSafe[T any](arr []T, index int) *T {
	if index >= len(arr) {
		return nil
	}
	return &arr[index]
}

func All(arr ...bool) bool {
	for _, v := range arr {
		if !v {
			return false
		}
	}
	return true
}

func Any(arr ...bool) bool {
	for _, v := range arr {
		if v {
			return true
		}
	}
	return false
}

func Range(start int, end int) []int {
	var res []int
	for i := start; i < end; i++ {
		res = append(res, i)
	}
	return res
}

func GetStringConfs(key ...string) string {
	for _, k := range key {
		if v := viper.GetString(k); len(v) > 0 {
			return v
		}
	}

	return ""
}