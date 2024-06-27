package web

import (
	"chat/globals"
	"chat/utils"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type SearXNGResponse struct {
	Query           string `json:"query"`
	NumberOfResults int    `json:"number_of_results"`
	Results         []struct {
		Url           string   `json:"url"`
		Title         string   `json:"title"`
		Content       string   `json:"content"`
		PublishedDate *string  `json:"publishedDate,omitempty"`
		Thumbnail     *string  `json:"thumbnail,omitempty"`
		Engine        string   `json:"engine"`
		ParsedUrl     []string `json:"parsed_url"`
		Template      string   `json:"template"`
		Engines       []string `json:"engines"`
		Positions     []int    `json:"positions"`
		Score         float64  `json:"score"`
		Category      string   `json:"category"`
		IframeSrc     string   `json:"iframe_src,omitempty"`
	} `json:"results"`
	Answers             []interface{} `json:"answers"`
	Corrections         []interface{} `json:"corrections"`
	Infoboxes           []interface{} `json:"infoboxes"`
	Suggestions         []interface{} `json:"suggestions"`
	UnresponsiveEngines [][]string    `json:"unresponsive_engines"`
}

func formatResponse(data *SearXNGResponse) string {
	res := make([]string, 0)
	for _, item := range data.Results {
		if item.Content == "" || item.Url == "" || item.Title == "" {
			continue
		}

		res = append(res, fmt.Sprintf("%s (%s): %s", item.Title, item.Url, item.Content))
	}

	return strings.Join(res, "\n")
}

func createURLParams(query string) string {
	params := url.Values{}

	params.Add("q", query)
	params.Add("format", "json")
	params.Add("safesearch", strconv.Itoa(globals.SearchSafeSearch))
	if len(globals.SearchEngines) > 0 {
		params.Add("engines", globals.SearchEngines)
	}
	if len(globals.SearchImageProxy) > 0 {
		params.Add("image_proxy", globals.SearchImageProxy)
	}

	return fmt.Sprintf("%s?%s", globals.SearchEndpoint, params.Encode())
}

func createSearXNGRequest(query string) (*SearXNGResponse, error) {
	data, err := utils.Get(createURLParams(query), nil)

	if err != nil {
		return nil, err
	}

	return utils.MapToRawStruct[SearXNGResponse](data)
}

func GenerateSearchResult(q string) (string, error) {
	res, err := createSearXNGRequest(q)
	if err != nil {
		globals.Warn(fmt.Sprintf("[web] failed to get search result: %s (query: %s)", err.Error(), utils.Extract(q, 20, "...")))

		content := fmt.Sprintf("search failed: %s", err.Error())
		return content, errors.New(content)
	}

	content := formatResponse(res)
	globals.Debug(fmt.Sprintf("[web] search result: %s (query: %s)", utils.Extract(content, 50, "..."), q))

	if globals.SearchCrop {
		globals.Debug(fmt.Sprintf("[web] crop search result length %d to %d max", len(content), globals.SearchCropLength))
		return utils.Extract(content, globals.SearchCropLength, "..."), nil
	}
	return content, nil
}

func TestSearch(c *gin.Context) {
	// get `query` param from query
	query := c.Query("query")

	fmt.Println(query)

	res, err := GenerateSearchResult(query)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  err.Error(),
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status": true,
			"result": res,
		})
	}
}
