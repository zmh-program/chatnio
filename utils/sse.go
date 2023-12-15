package utils

import (
	"bufio"
	"bytes"
	"chat/globals"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"strings"
)

var dataReplacer = strings.NewReplacer(
	"\n", "\ndata:",
	"\r", "\\r",
)

type StreamEvent struct {
	Event string      `json:"event"`
	Id    string      `json:"id"`
	Data  interface{} `json:"data"`
}

type stringWriter interface {
	io.Writer
	writeString(string) (int, error)
}

type stringWrapper struct {
	io.Writer
}

func (w stringWrapper) writeString(str string) (int, error) {
	return w.Writer.Write([]byte(str))
}

func checkWriter(writer io.Writer) stringWriter {
	if w, ok := writer.(stringWriter); ok {
		return w
	} else {
		return stringWrapper{writer}
	}
}

func encode(writer io.Writer, event StreamEvent) error {
	w := checkWriter(writer)
	return writeData(w, event.Data)
}

func writeData(w stringWriter, data interface{}) error {
	dataReplacer.WriteString(w, fmt.Sprint(data))
	if strings.HasPrefix(data.(string), "data") {
		w.writeString("\n\n")
	}
	return nil
}

func (r StreamEvent) Render(w http.ResponseWriter) error {
	r.WriteContentType(w)
	return encode(w, r)
}

func (r StreamEvent) WriteContentType(w http.ResponseWriter) {
	header := w.Header()
	header["Content-Type"] = []string{"text/event-stream"}

	if _, exist := header["Cache-Control"]; !exist {
		header["Cache-Control"] = []string{"no-cache"}
	}
}

func NewEvent(data interface{}) StreamEvent {
	chunk := Marshal(data)
	return StreamEvent{
		Data: fmt.Sprintf("data: %s", chunk),
	}
}

func NewEndEvent() StreamEvent {
	return StreamEvent{
		Data: "data: [DONE]",
	}
}

func SSEClient(method string, uri string, headers map[string]string, body interface{}, callback func(string) error) error {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	client := newClient()
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

	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return fmt.Errorf("request failed with status: %s", res.Status)
	}

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
