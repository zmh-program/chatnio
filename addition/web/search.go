package web

import (
	"chat/utils"
	"net/url"
)

func GetBingUrl(q string) string {
	return "https://bing.com/search?q=" + url.QueryEscape(q)
}

func RequestWithUA(url string) string {
	data, err := utils.GetRaw(url, map[string]string{
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
		"Accept":     "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	})

	if err != nil {
		return ""
	}

	return data
}

func SearchWebResult(q string) string {
	if res := CallDuckDuckGoAPI(q); res != nil {
		if resp := formatResponse(res); resp != "" {
			return resp
		}
	}

	uri := GetBingUrl(q)
	if res := CallPilotAPI(uri); res != nil {
		return utils.Marshal(res.Results)
	}
	data := RequestWithUA(uri)
	return ParseBing(data)
}
