package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
)

type ChatRequest struct {
	ID           int           `json:"id"`
	Conversation []interface{} `json:"conversation"`
}

type ChatResponse struct {
	ID    int         `json:"id"`
	Reply interface{} `json:"reply"`
}

type ChatGPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func Http(uri string, method string, ptr interface{}, headers map[string]string, body io.Reader) (err error) {
	req, err := http.NewRequest(method, uri, body)
	if err != nil {
		return err
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if err = json.NewDecoder(resp.Body).Decode(ptr); err != nil {
		return err
	}
	return nil
}

func Get(uri string, headers map[string]string) (data interface{}, err error) {
	err = Http(uri, http.MethodGet, &data, headers, nil)
	return data, err
}

func Post(uri string, headers map[string]string, body interface{}) (data interface{}, err error) {
	var form io.Reader
	if buffer, err := json.Marshal(body); err == nil {
		form = bytes.NewBuffer(buffer)
	}
	err = Http(uri, http.MethodPost, &data, headers, form)
	return data, err
}

func PostForm(uri string, body map[string]interface{}) (data map[string]interface{}, err error) {
	client := &http.Client{}
	form := make(url.Values)
	for key, value := range body {
		form[key] = []string{value.(string)}
	}
	res, err := client.PostForm(uri, form)
	if err != nil {
		return nil, err
	}
	content, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(content, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func Contains[T comparable](value T, slice []T) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

func GetResponse(conversation []interface{}) (string, error) {
	res, err := Post("https://api.openai.com/v1/chat/completions", map[string]string{
		"Content-Type":  "application/json",
		"Authorization": "Bearer " + "sk-...",
	}, map[string]interface{}{
		"model":      "gpt-3.5-turbo-16k",
		"messages":   conversation,
		"max_tokens": 150,
	})
	if err != nil {
		return "", err
	}
	fmt.Println(res, conversation)
	data := res.(map[string]interface{})["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"]
	return data.(string), nil
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "client.html")
	})
	http.HandleFunc("/chat", chatHandler)

	fmt.Println("API server is running on http://localhost:3000/")
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Failed to read request body:", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var request ChatRequest
	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Println("Failed to parse request body:", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	reply, err := GetResponse(request.Conversation)
	if err != nil {
		log.Println("Failed to get response:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	response := ChatResponse{
		ID:    request.ID,
		Reply: reply,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		log.Println("Failed to encode response:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(responseJSON)
	if err != nil {
		return
	}
}
