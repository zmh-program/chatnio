package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
)

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
	err = Http(uri, http.MethodPost, &data, headers, ConvertBody(body))
	return data, err
}

func ConvertBody(body interface{}) (form io.Reader) {
	if buffer, err := json.Marshal(body); err == nil {
		form = bytes.NewBuffer(buffer)
	}
	return form
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
