package utils

import (
	"bufio"
	"bytes"
	"chat/globals"
	"crypto/tls"
	"fmt"
	"net/http"
)

func SSEClient(method string, uri string, headers map[string]string, body interface{}, callback func(string) error) error {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	client := &http.Client{}
	req, err := http.NewRequest(method, uri, ConvertBody(body))
	if err != nil {
		return nil
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	res, err := client.Do(req)
	if err != nil {
		return err
	}
	if res.StatusCode >= 400 {
		return fmt.Errorf("request failed with status: %s", res.Status)
	}

	defer res.Body.Close()

	events, err := CreateSSEInstance(res)
	if err != nil {
		return err
	}

	select {
	case ev := <-events:
		if err := callback(ev.Data); err != nil {
			return err
		}
	}

	return nil
}

// Event represents a Server-Sent Event
type Event struct {
	Name string
	ID   string
	Data string
}

func CreateSSEInstance(resp *http.Response) (chan Event, error) {
	events := make(chan Event)
	reader := bufio.NewReader(resp.Body)

	go loop(reader, events)

	return events, nil
}

func loop(reader *bufio.Reader, events chan Event) {
	ev := Event{}

	var buf bytes.Buffer

	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			globals.Info(fmt.Sprintf("[sse] error during read response body: %s", err))
			close(events)
		}

		switch {
		case ioPrefix(line, ":"):
			// Comment, do nothing
		case ioPrefix(line, "retry:"):
			// Retry, do nothing for now

		// id of event
		case ioPrefix(line, "id: "):
			ev.ID = string(line[4:])
		case ioPrefix(line, "id:"):
			ev.ID = string(line[3:])

		// name of event
		case ioPrefix(line, "event: "):
			ev.Name = string(line[7 : len(line)-1])
		case ioPrefix(line, "event:"):
			ev.Name = string(line[6 : len(line)-1])

		// event data
		case ioPrefix(line, "data: "):
			buf.Write(line[6:])
		case ioPrefix(line, "data:"):
			buf.Write(line[5:])

		// end of event
		case bytes.Equal(line, []byte("\n")):
			b := buf.Bytes()

			if ioPrefix(b, "{") {
				if err == nil {
					ev.Data = string(b)
					buf.Reset()
					events <- ev
					ev = Event{}
				}
			}

		default:
			globals.Info(fmt.Sprintf("[sse] unknown line: %s", line))
		}
	}
}

func ioPrefix(s []byte, prefix string) bool {
	return bytes.HasPrefix(s, []byte(prefix))
}
