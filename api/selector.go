package api

import "strings"

func FilterKeys(keys string) string {
	stack := make(chan string, len(strings.Split(keys, "|")))
	for _, key := range strings.Split(keys, "|") {
		go func(key string) {
			if TestKey(key) {
				stack <- key
			} else {
				stack <- ""
			}
		}(key)
	}

	var result string
	for i := 0; i < len(strings.Split(keys, "|")); i++ {
		if res := <-stack; res != "" {
			result += res + "|"
		}
	}
	return strings.Trim(result, "|")
}
