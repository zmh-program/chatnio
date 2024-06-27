package web

import (
	"chat/globals"
	"chat/utils"
	"fmt"
)

func SearchWebResult(q string) string {
	res, err := CallDuckDuckGoAPI(q)
	if err != nil {
		globals.Warn(fmt.Sprintf("[web] failed to get search result: %s (query: %s)", err.Error(), q))
		return ""
	}

	content := formatResponse(res)
	globals.Debug(fmt.Sprintf("[web] search result: %s (query: %s)", utils.Extract(content, 50, "..."), q))
	return content
}
