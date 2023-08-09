package utils

import "fmt"

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
