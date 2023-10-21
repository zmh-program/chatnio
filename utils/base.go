package utils

import (
	"encoding/json"
	"fmt"
)

func Contains[T comparable](value T, slice []T) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
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
