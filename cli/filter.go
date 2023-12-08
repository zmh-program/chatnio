package cli

import (
	"chat/adapter/chatgpt"
	"fmt"
	"strings"
)

func FilterApiKeyCommand(args []string) {
	data := strings.Trim(strings.TrimSpace(GetArgString(args, 0)), "\"")
	endpoint := "https://api.openai.com"
	keys := strings.Split(data, "|")

	available := chatgpt.FilterKeysNative(endpoint, keys)

	outputInfo("filter", fmt.Sprintf("filtered %d keys, %d available, %d unavailable", len(keys), len(available), len(keys)-len(available)))
	fmt.Println(strings.Join(available, "|"))
}
