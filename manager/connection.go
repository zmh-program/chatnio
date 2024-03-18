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
	MaskType    = "mask"
	EditType    = "edit"
	RemoveType  = "remove"
)

type Stack chan *conversation.FormMessage

type Connection struct {
	conn  *utils.WebSocket
	stack Stack
	auth  bool
	hash  string
}

func NewConnection(conn *utils.WebSocket, auth bool, hash string, bufferSize int) *Connection {
	return &Connection{
		conn:  conn,
		auth:  auth,
		hash:  hash,
		stack: make(Stack, bufferSize),
	}
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
	for {
		if c.IsClosed() {
			break
		}

		form, err := utils.ReadForm[conversation.FormMessage](c.conn)
		if err != nil {
			break
		}

		if form.Type == "" {
			form.Type = ChatType
		}

		c.Write(form)
	}

	c.Stop()
}

func (c *Connection) Write(data *conversation.FormMessage) {
	if len(c.stack) == cap(c.stack) {
		c.Skip()
	}
	c.stack <- data
}

func (c *Connection) IsClosed() bool {
	return c.conn.IsClosed()
}

func (c *Connection) Stop() {
	c.Write(nil)
}

func (c *Connection) Read() *conversation.FormMessage {
	form := <-c.stack
	return form
}

func (c *Connection) Peek() *conversation.FormMessage {
	select {
	case form := <-c.stack:
		utils.InsertChannel(c.stack, form, 0)
		return form
	default:
		return nil
	}
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

func (c *Connection) PeekWithTypes(types ...string) *conversation.FormMessage {
	// skip if type is matched

	if form := c.Peek(); form != nil {
		for _, t := range types {
			if form.Type == t {
				c.Skip()
				return form
			}
		}
	}

	return nil
}

func (c *Connection) PeekStop() *conversation.FormMessage {
	return c.PeekWithTypes(StopType, RemoveType)
}

func (c *Connection) Skip() {
	<-c.stack
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

func (c *Connection) Process(handler func(*conversation.FormMessage) error) {
	for {
		if form := c.Read(); form != nil {
			if err := handler(form); err != nil {
				return
			}
		} else {
			return
		}
	}
}

func (c *Connection) Handle(handler func(*conversation.FormMessage) error) {
	go c.Process(handler)
	c.ReadWorker()
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
