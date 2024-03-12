package utils

import (
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
