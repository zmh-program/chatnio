package api

import (
	"chat/types"
	"chat/utils"
	"crypto/tls"
	"encoding/json"
	"github.com/spf13/viper"
	"io"
	"log"
	"net/http"
	"strings"
)

func processLine(buf []byte) []string {
	data := strings.Trim(string(buf), "\n")
	rep := strings.NewReplacer(
		"data: {",
		"\"data\": {",
	)
	data = rep.Replace(data)
	array := strings.Split(data, "\n")
	resp := make([]string, 0)
	for _, item := range array {
		item = strings.TrimSpace(item)
		if !strings.HasPrefix(item, "{") {
			item = "{" + item
		}
		if !strings.HasSuffix(item, "}}") {
			item = item + "}"
		}

		if item == "{data: [DONE]}" || item == "{data: [DONE]}}" || item == "{[DONE]}" {
			break
		} else if item == "{data:}" || item == "{data:}}" {
			continue
		}

		var form types.ChatGPTStreamResponse
		if err := json.Unmarshal([]byte(item), &form); err != nil {
			if err := json.Unmarshal([]byte(item[:len(item)-1]), &form); err != nil {
				log.Println(item, err)
			}
		}
		choices := form.Data.Choices
		if len(choices) > 0 {
			resp = append(resp, choices[0].Delta.Content)
		}
	}
	return resp
}

func StreamRequest(model string, messages []types.ChatGPTMessage, token int, callback func(string)) {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	client := &http.Client{}
	req, err := http.NewRequest("POST", viper.GetString("openai.user_endpoint")+"/chat/completions", utils.ConvertBody(types.ChatGPTRequest{
		Model:    model,
		Messages: messages,
		MaxToken: token,
		Stream:   true,
	}))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GetRandomKey(viper.GetString("openai.user")))

	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	for {
		buf := make([]byte, 20480)
		n, err := res.Body.Read(buf)

		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println(err)
		}

		for _, item := range processLine(buf[:n]) {
			callback(item)
		}
	}
}
