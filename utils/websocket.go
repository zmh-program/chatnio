package utils

import (
	"chat/globals"
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"io"
	"net/http"
	"time"
)

type WebSocket struct {
	Ctx        *gin.Context
	Conn       *websocket.Conn
	MaxTimeout time.Duration
	Closed     bool
}

var defaultMaxTimeout = 15 * time.Minute

func CheckUpgrader(c *gin.Context, strict bool) *websocket.Upgrader {
	return &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			if !strict {
				return true
			}
			origin := c.Request.Header.Get("Origin")
			if globals.OriginIsAllowed(origin) {
				return true
			}
			return false
		},
	}
}

func NewWebsocket(c *gin.Context, strict bool) *WebSocket {
	upgrader := CheckUpgrader(c, strict)
	if conn, err := upgrader.Upgrade(c.Writer, c.Request, nil); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "",
			"reason":  err.Error(),
		})
		return nil
	} else {
		instance := &WebSocket{
			Ctx:  c,
			Conn: conn,
		}
		instance.Init()
		return instance
	}
}

func NewWebsocketClient(url string) *WebSocket {
	if conn, _, err := websocket.DefaultDialer.Dial(url, nil); err != nil {
		return nil
	} else {
		instance := &WebSocket{
			Conn: conn,
		}
		instance.Init()
		return instance
	}
}

func (w *WebSocket) Init() {
	w.Closed = false

	w.Conn.SetCloseHandler(func(code int, text string) error {
		w.Closed = true
		return nil
	})

	w.Conn.SetPongHandler(func(appData string) error {
		return w.Conn.SetReadDeadline(time.Now().Add(w.GetMaxTimeout()))
	})
}

func (w *WebSocket) SetMaxTimeout(timeout time.Duration) {
	w.MaxTimeout = timeout
}

func (w *WebSocket) GetMaxTimeout() time.Duration {
	if w.MaxTimeout <= 0 {
		return defaultMaxTimeout
	}
	return w.MaxTimeout
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
	state, err := IncrWithLimit(cache, key, 1, limit, expiration)
	return state && err == nil
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

func (w *WebSocket) GetConn() *websocket.Conn {
	return w.Conn
}

func (w *WebSocket) IsClosed() bool {
	return w.Closed
}

func ReadForm[T interface{}](w *WebSocket) (*T, error) {
	// golang cannot use generic type in class-like struct
	// except ping
	_, message, err := w.Read()
	if err != nil {
		return nil, err
	} else if string(message) == "{\"type\":\"ping\"}" {
		return ReadForm[T](w)
	}

	form, err := Unmarshal[T](message)
	if err != nil {
		return nil, err
	}
	return &form, nil
}
