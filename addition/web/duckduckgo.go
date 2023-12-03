package web

import (
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"net/url"
	"strings"
)

type DDGResponse struct {
	Results []struct {
		Body  string `json:"body"`
		Href  string `json:"href"`
		Title string `json:"title"`
	} `json:"results"`
}

func formatResponse(data *DDGResponse) string {
	res := make([]string, 0)
	for _, item := range data.Results {
		if item.Body == "" || item.Href == "" || item.Title == "" {
			continue
		}

		res = append(res, fmt.Sprintf("%s (%s): %s", item.Title, item.Href, item.Body))
	}

	return strings.Join(res, "\n")
}

func CallDuckDuckGoAPI(query string) *DDGResponse {
	query = url.QueryEscape(query)
	data, err := utils.Get(fmt.Sprintf("%s/search?q=%s&max_results=%d", viper.GetString("system.ddg"), query, viper.GetInt("system.ddg_max_results")), nil)
	if err != nil {
		return nil
	}

	return utils.MapToStruct[DDGResponse](data)
}
