package hunyuan

/*
 * Copyright (c) 2017-2018 THL A29 Limited, a Tencent company. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import (
	"bufio"
	"bytes"
	"chat/globals"
	"context"
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"io"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	defaultProtocol = "https"
	defaultHost     = "hunyuan.cloud.tencent.com"
	path            = "/hyllm/v1/chat/completions?"
)

const (
	Synchronize = iota
	Stream
)

func getUrl(endpoint string) string {
	return fmt.Sprintf("%s://%s%s", getProtocol(endpoint), getHost(endpoint), path)
}

func getProtocol(endpoint string) string {
	seg := strings.Split(endpoint, "://")
	if len(seg) > 0 && seg[0] != "" {
		return seg[0]
	}

	return defaultProtocol
}

func getHost(endpoint string) string {
	seg := strings.Split(endpoint, "://")
	if len(seg) > 1 && seg[1] != "" {
		return seg[1]
	}

	return defaultHost
}

func getFullPath(endpoint string) string {
	return getHost(endpoint) + path
}

type ResponseChoices struct {
	FinishReason string            `json:"finish_reason,omitempty"`
	Messages     []globals.Message `json:"messages,omitempty"`
	Delta        globals.Message   `json:"delta,omitempty"`
}

type ResponseUsage struct {
	PromptTokens     int64 `json:"prompt_tokens,omitempty"`
	TotalTokens      int64 `json:"total_tokens,omitempty"`
	CompletionTokens int64 `json:"completion_tokens,omitempty"`
}

type ResponseError struct {
	Message string `json:"message,omitempty"`
	Code    int    `json:"code,omitempty"`
}

type StreamDelta struct {
	Content string `json:"content"`
}

type ChatRequest struct {
	AppID       int64             `json:"app_id"`
	SecretID    string            `json:"secret_id"`
	Timestamp   int               `json:"timestamp"`
	Expired     int               `json:"expired"`
	QueryID     string            `json:"query_id"`
	Temperature float64           `json:"temperature"`
	TopP        float64           `json:"top_p"`
	Stream      int               `json:"stream"`
	Messages    []globals.Message `json:"messages"`
}

type ChatResponse struct {
	Choices []ResponseChoices `json:"choices,omitempty"`
	Created string            `json:"created,omitempty"`
	ID      string            `json:"id,omitempty"`
	Usage   ResponseUsage     `json:"usage,omitempty"`
	Error   ResponseError     `json:"error,omitempty"`
	Note    string            `json:"note,omitempty"`
	ReqID   string            `json:"req_id,omitempty"`
}

type Credential struct {
	SecretID  string
	SecretKey string
}

func NewCredential(secretID, secretKey string) *Credential {
	return &Credential{SecretID: secretID, SecretKey: secretKey}
}

type Client struct {
	Credential *Credential
	AppID      int64
	EndPoint   string
}

func NewInstance(appId int64, endpoint string, credential *Credential) *Client {
	return &Client{
		Credential: credential,
		AppID:      appId,
		EndPoint:   endpoint,
	}
}

func NewRequest(mod int, messages []globals.Message, temperature *float32, topP *float32) ChatRequest {
	queryID := uuid.NewString()
	return ChatRequest{
		Timestamp:   int(time.Now().Unix()),
		Expired:     int(time.Now().Unix()) + 24*60*60,
		Temperature: 0,
		TopP:        0.8,
		Messages:    messages,
		QueryID:     queryID,
		Stream:      mod,
	}
}

func (t *Client) getHttpReq(ctx context.Context, req ChatRequest) (*http.Request, error) {
	req.AppID = t.AppID
	req.SecretID = t.Credential.SecretID
	signatureUrl := t.buildURL(req)
	signature := t.genSignature(signatureUrl)
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("json marshal err: %+v", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", getUrl(t.EndPoint), bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("new http request err: %+v", err)
	}
	httpReq.Header.Set("Authorization", signature)
	httpReq.Header.Set("Content-Type", "application/json")

	if req.Stream == Stream {
		httpReq.Header.Set("Cache-Control", "no-cache")
		httpReq.Header.Set("Connection", "keep-alive")
		httpReq.Header.Set("Accept", "text/event-Stream")
	}

	return httpReq, nil
}

func (t *Client) Chat(ctx context.Context, req ChatRequest) (<-chan ChatResponse, error) {
	res := make(chan ChatResponse, 1)
	httpReq, err := t.getHttpReq(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("do general http request err: %+v", err)
	}
	httpResp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("do chat request err: %+v", err)
	}

	if httpResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("do chat request failed status code :%d", httpResp.StatusCode)
	}

	if req.Stream == Synchronize {
		err = t.synchronize(httpResp, res)
		return res, err
	}
	go t.stream(httpResp, res)
	return res, nil
}

func (t *Client) synchronize(httpResp *http.Response, res chan ChatResponse) (err error) {
	defer func() {
		httpResp.Body.Close()
		close(res)
	}()
	var chatResp ChatResponse
	respBody, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return fmt.Errorf("read response body err: %+v", err)
	}

	if err = json.Unmarshal(respBody, &chatResp); err != nil {
		return fmt.Errorf("json unmarshal err: %+v", err)
	}
	res <- chatResp
	return
}

func (t *Client) stream(httpResp *http.Response, res chan ChatResponse) {
	defer func() {
		httpResp.Body.Close()
		close(res)
	}()
	reader := bufio.NewReader(httpResp.Body)
	for {
		raw, err := reader.ReadBytes('\n')
		if err != nil {
			if err == io.EOF {
				return
			}
			res <- ChatResponse{Error: ResponseError{Message: fmt.Sprintf("tencent error: read stream data failed: %+v", err), Code: 500}}
			return
		}

		data := strings.TrimSpace(string(raw))
		if data == "" || !strings.HasPrefix(data, "data: ") {
			continue
		}

		var chatResponse ChatResponse
		if err := json.Unmarshal([]byte(data[6:]), &chatResponse); err != nil {
			res <- ChatResponse{Error: ResponseError{Message: fmt.Sprintf("json unmarshal err: %+v", err), Code: 500}}
			return
		}

		res <- chatResponse
		if chatResponse.Choices[0].FinishReason == "stop" {
			return
		}
	}
}

func (t *Client) genSignature(url string) string {
	mac := hmac.New(sha1.New, []byte(t.Credential.SecretKey))
	signURL := url
	mac.Write([]byte(signURL))
	sign := mac.Sum([]byte(nil))
	return base64.StdEncoding.EncodeToString(sign)
}

func (t *Client) getMessages(messages []globals.Message) string {
	var message string
	for _, msg := range messages {
		message += fmt.Sprintf(`{"role":"%s","content":"%s"},`, msg.Role, msg.Content)
	}
	message = strings.TrimSuffix(message, ",")

	return message
}

func (t *Client) buildURL(req ChatRequest) string {
	params := make([]string, 0)
	params = append(params, "app_id="+strconv.FormatInt(req.AppID, 10))
	params = append(params, "secret_id="+req.SecretID)
	params = append(params, "timestamp="+strconv.Itoa(req.Timestamp))
	params = append(params, "query_id="+req.QueryID)
	params = append(params, "temperature="+strconv.FormatFloat(req.Temperature, 'f', -1, 64))
	params = append(params, "top_p="+strconv.FormatFloat(req.TopP, 'f', -1, 64))
	params = append(params, "stream="+strconv.Itoa(req.Stream))
	params = append(params, "expired="+strconv.Itoa(req.Expired))
	params = append(params, fmt.Sprintf("messages=[%s]", t.getMessages(req.Messages)))

	sort.Sort(sort.StringSlice(params))
	return getFullPath(t.EndPoint) + strings.Join(params, "&")
}
