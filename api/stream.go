package api

import (
	"chat/types"
	"chat/utils"
	"crypto/tls"
	"encoding/json"
	"fmt"
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

func MixRequestBody(model string, messages []types.ChatGPTMessage, token int) interface{} {
	if token == -1 {
		return types.ChatGPTRequestWithInfinity{
			Model:    model,
			Messages: messages,
			Stream:   true,
		}
	}

	return types.ChatGPTRequest{
		Model:    model,
		Messages: messages,
		MaxToken: token,
		Stream:   true,
	}
}

func NativeStreamRequest(model string, endpoint string, apikeys string, messages []types.ChatGPTMessage, token int, callback func(string)) {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	client := &http.Client{}
	req, err := http.NewRequest("POST", endpoint+"/chat/completions", utils.ConvertBody(MixRequestBody(model, messages, token)))
	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GetRandomKey(apikeys))

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(fmt.Sprintf("[stream] error: %s (status: %d)", err.Error(), res.StatusCode))
		return
	} else if res.StatusCode >= 400 || res.StatusCode < 200 || res == nil {
		fmt.Println(fmt.Sprintf("[stream] request failed (status: %d)", res.StatusCode))
		return
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

func StreamRequest(model string, enableReverse bool, messages []types.ChatGPTMessage, token int, callback func(string)) {
	switch model {
	case types.GPT4,
		types.GPT40314,
		types.GPT40613:
		if enableReverse {
			NativeStreamRequest(viper.GetString("openai.reverse"), viper.GetString("openai.pro_endpoint"), viper.GetString("openai.pro"), messages, token, callback)
		} else {
			NativeStreamRequest(types.GPT40613, viper.GetString("openai.gpt4_endpoint"), viper.GetString("openai.gpt4"), messages, token, callback)
		}
	case types.GPT432k,
		types.GPT432k0613,
		types.GPT432k0314:
		NativeStreamRequest(types.GPT432k0613, viper.GetString("openai.gpt4_endpoint"), viper.GetString("openai.gpt4"), messages, token, callback)
	case types.GPT3Turbo16k,
		types.GPT3Turbo16k0301,
		types.GPT3Turbo16k0613:
		NativeStreamRequest(types.GPT3Turbo16k0613, viper.GetString("openai.user_endpoint"), viper.GetString("openai.user"), messages, token, callback)
	case types.Claude2,
		types.Claude2100k:
		NativeStreamRequest(model, viper.GetString("claude.endpoint"), viper.GetString("claude.key"), messages, token, callback)
	default:
		NativeStreamRequest(types.GPT3Turbo0613, viper.GetString("openai.anonymous_endpoint"), viper.GetString("openai.anonymous"), messages, token, callback)
	}
}
