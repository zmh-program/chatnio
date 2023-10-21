package manager

import (
	"chat/globals"
	"chat/manager/conversation"
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

const (
	ChatType    = "chat"
	StopType    = "stop"
	RestartType = "restart"
	ShareType   = "share"
)

type Stack []*conversation.FormMessage

type Connection struct {
	conn  *utils.WebSocket
	stack Stack
	auth  bool
	hash  string
}

func NewConnection(conn *utils.WebSocket, auth bool, hash string, bufferSize int) *Connection {
	buf := &Connection{
		conn:  conn,
		auth:  auth,
		hash:  hash,
		stack: make(Stack, bufferSize),
	}
	buf.ReadWorker()
	return buf
}

func (c *Connection) GetConn() *utils.WebSocket {
	return c.conn
}

func (c *Connection) GetCtx() *gin.Context {
	return c.conn.GetCtx()
}

func (c *Connection) GetStack() Stack {
	return c.stack
}

func (c *Connection) ReadWorker() {
	go func() {
		for {
			form := utils.ReadForm[conversation.FormMessage](c.conn)
			if form.Type == "" {
				form.Type = ChatType
			}

			c.Write(form)

			if form == nil {
				return
			}
		}
	}()
}

func (c *Connection) Write(data *conversation.FormMessage) {
	c.stack = append(c.stack, data)
}

func (c *Connection) Read() (*conversation.FormMessage, bool) {
	if len(c.stack) == 0 {
		return nil, false
	}
	form := c.stack[0]
	c.Skip()
	return form, true
}

func (c *Connection) ReadWithBlock() *conversation.FormMessage {
	// return: nil if connection is closed
	for {
		if form, ok := c.Read(); ok {
			return form
		}
	}
}

func (c *Connection) Peek() *conversation.FormMessage {
	// return nil if no message is received
	if len(c.stack) == 0 {
		return nil
	}
	return c.ReadWithBlock()
}

func (c *Connection) PeekWithType(t string) *conversation.FormMessage {
	// skip if type is matched

	if form := c.Peek(); form != nil {
		if form.Type == t {
			c.Skip()
			return form
		}
	}

	return nil
}

func (c *Connection) Skip() {
	if len(c.stack) == 0 {
		return
	}
	c.stack = c.stack[1:]
}

func (c *Connection) GetDB() *sql.DB {
	return c.conn.GetDB()
}

func (c *Connection) GetCache() *redis.Client {
	return c.conn.GetCache()
}

func (c *Connection) Send(message globals.ChatSegmentResponse) {
	c.conn.Send(message)
}

func (c *Connection) SendClient(message globals.ChatSegmentResponse) error {
	return c.conn.SendJSON(message)
}

func (c *Connection) Handle(handler func(*conversation.FormMessage) error) {
	defer c.conn.DeferClose()

	for {
		form := c.ReadWithBlock()
		if form == nil {
			return
		}

		if !c.Lock() {
			return
		}

		if err := handler(form); err != nil {
			return
		}

		c.Release()
	}
}

func (c *Connection) Lock() bool {
	state := c.conn.IncrRateWithLimit(
		c.hash,
		utils.Multi[int64](c.auth, globals.ChatMaxThread, globals.AnonymousMaxThread),
		60,
	)

	if !state {
		c.conn.Send(globals.ChatSegmentResponse{
			Message: fmt.Sprintf("You have reached the maximum number of threads (%d) the same time. Please wait for a while.", globals.ChatMaxThread),
			End:     true,
		})

		return false
	}

	return true
}

func (c *Connection) Release() {
	c.conn.DecrRate(c.hash)
}
