package utils

import (
	"bufio"
	"bytes"
	"chat/globals"
	"fmt"
	"io"
	"net/http"
	"runtime/debug"
	"strings"
)

type EventScannerProps struct {
	Method   string
	Uri      string
	Headers  map[string]string
	Body     interface{}
	Callback func(string) error
}

type EventScannerError struct {
	Error error
	Body  string
}

func getErrorBody(resp *http.Response) string {
	if resp == nil {
		return ""
	}

	if content, err := io.ReadAll(resp.Body); err == nil {
		return string(content)
	}

	return ""
}

func EventScanner(props *EventScannerProps, config ...globals.ProxyConfig) *EventScannerError {
	// panic recovery
	defer func() {
		if r := recover(); r != nil {
			stack := debug.Stack()
			globals.Warn(fmt.Sprintf("event source panic: %s (uri: %s, method: %s)\n%s", r, props.Uri, props.Method, stack))
		}
	}()

	if globals.DebugMode {
		globals.Debug(fmt.Sprintf("[sse] event source: %s %s\nheaders: %v\nbody: %v", props.Method, props.Uri, Marshal(props.Headers), Marshal(props.Body)))
	}

	client := newClient(config)
	req, err := http.NewRequest(props.Method, props.Uri, ConvertBody(props.Body))
	if err != nil {
		if globals.DebugMode {
			globals.Debug(fmt.Sprintf("[sse] failed to create request: %s", err))
		}

		return &EventScannerError{Error: err}
	}

	fillHeaders(req, props.Headers)

	resp, err := client.Do(req)
	if err != nil {
		if globals.DebugMode {
			globals.Debug(fmt.Sprintf("[sse] failed to send request: %s", err))
		}

		return &EventScannerError{Error: err}
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		// for error response
		body := getErrorBody(resp)
		if globals.DebugMode {
			globals.Debug(fmt.Sprintf("[sse] request failed with status: %s\nresponse: %s", resp.Status, body))
		}

		return &EventScannerError{
			Error: fmt.Errorf("request failed with status code: %d", resp.StatusCode),
			Body:  body,
		}
	}

	scanner := bufio.NewScanner(resp.Body)
	scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
		if atEOF && len(data) == 0 {
			// when EOF and empty data
			return 0, nil, nil
		}

		if idx := bytes.Index(data, []byte("\n")); idx >= 0 {
			// when found new line
			return idx + 1, data[:idx], nil
		}

		if atEOF {
			// when EOF and no new line
			return len(data), data, nil
		}

		// when need more data
		return 0, nil, nil
	})

	for scanner.Scan() {
		raw := scanner.Text()

		if len(raw) <= 5 || !strings.HasPrefix(raw, "data:") {
			// for only `data:` partial raw or unexpected chunk
			continue
		}

		if globals.DebugMode {
			globals.Debug(fmt.Sprintf("[sse] chunk: %s", raw))
		}

		chunk := strings.TrimSpace(strings.TrimPrefix(raw, "data:"))
		if chunk == "[DONE]" || strings.HasPrefix(chunk, "[DONE]") {
			// for done signal
			continue
		}

		// callback chunk
		if err := props.Callback(chunk); err != nil {
			// break connection on callback error
			err := resp.Body.Close()
			if err != nil {
				globals.Debug(fmt.Sprintf("[sse] event source close error: %s", err.Error()))
			}

			return &EventScannerError{Error: err}
		}
	}

	return nil
}
