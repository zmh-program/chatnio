package web

import (
	"chat/utils"
	"github.com/google/uuid"
)

type PilotResponseResult struct {
	Title   string `json:"title"`
	Link    string `json:"link"`
	Snippet string `json:"snippet"`
}

type PilotResponse struct {
	Results []PilotResponseResult `json:"extra_search_results" required:"true"`
}

func GenerateFriendUID() string {
	return uuid.New().String()
}

func CallPilotAPI(url string) *PilotResponse {
	data, err := utils.Post("https://webreader.webpilotai.com/api/visit-web", map[string]string{
		"Content-Type":        "application/json",
		"WebPilot-Friend-UID": GenerateFriendUID(),
	}, map[string]interface{}{
		"link":             url,
		"user_has_request": false,
	})

	if err != nil {
		return nil
	}

	return utils.MapToStruct[PilotResponse](data)
}
