package utils

import (
	"chat/globals"
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"io"
	"net/http"
)

type WebSocket struct {
	Ctx  *gin.Context
	Conn *websocket.Conn
}

func CheckUpgrader(c *gin.Context) *websocket.Upgrader {
	return &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := c.Request.Header.Get("Origin")
			if Contains(origin, globals.AllowedOrigins) {
				return true
			}
			return false
		},
	}
}

func NewWebsocket(c *gin.Context) *WebSocket {
	upgrader := CheckUpgrader(c)
	if conn, err := upgrader.Upgrade(c.Writer, c.Request, nil); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  err.Error(),
		})
		return nil
	} else {
		return &WebSocket{
			Ctx:  c,
			Conn: conn,
		}
	}
}

func (w *WebSocket) Read() (int, []byte, error) {
	return w.Conn.ReadMessage()
}

func (w *WebSocket) Write(messageType int, data []byte) error {
	return w.Conn.WriteMessage(messageType, data)
}

func (w *WebSocket) Close() error {
	return w.Conn.Close()
}

func (w *WebSocket) DeferClose() {
	if err := w.Close(); err != nil {
		return
	}
}

func (w *WebSocket) NextWriter(messageType int) (io.WriteCloser, error) {
	return w.Conn.NextWriter(messageType)
}

func (w *WebSocket) ReadJSON(v interface{}) error {
	return w.Conn.ReadJSON(v)
}

func (w *WebSocket) SendJSON(v interface{}) error {
	return w.Conn.WriteJSON(v)
}

func (w *WebSocket) Send(v interface{}) bool {
	return w.SendJSON(v) == nil
}

func (w *WebSocket) Receive(v interface{}) bool {
	return w.ReadJSON(v) == nil
}

func (w *WebSocket) SendText(message string) bool {
	return w.Write(websocket.TextMessage, []byte(message)) == nil
}

func (w *WebSocket) DecrRate(key string) bool {
	cache := w.GetCache()
	return DecrInt(cache, key, 1)
}

func (w *WebSocket) IncrRate(key string) bool {
	cache := w.GetCache()
	_, err := Incr(cache, key, 1)
	return err == nil
}

func (w *WebSocket) IncrRateWithLimit(key string, limit int64, expiration int64) bool {
	cache := w.GetCache()
	return IncrWithLimit(cache, key, 1, limit, expiration)
}

func (w *WebSocket) GetCtx() *gin.Context {
	return w.Ctx
}

func (w *WebSocket) GetDB() *sql.DB {
	return GetDBFromContext(w.Ctx)
}

func (w *WebSocket) GetCache() *redis.Client {
	return GetCacheFromContext(w.Ctx)
}

func ReadForm[T comparable](w *WebSocket) *T {
	// golang cannot use generic type in class-like struct
	// except ping
	_, message, err := w.Read()
	if err != nil {
		return nil
	} else if string(message) == "{\"type\":\"ping\"}" {
		return ReadForm[T](w)
	}

	form, err := Unmarshal[T](message)
	if err != nil {
		return nil
	}
	return &form
}
