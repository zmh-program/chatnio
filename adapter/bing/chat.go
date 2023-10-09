package bing

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

type ChatProps struct {
	Message []globals.Message
	Model   string
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocketClient(c.GetEndpoint()); conn == nil {
		return fmt.Errorf("bing error: websocket connection failed")
	}
	defer conn.DeferClose()

	model := strings.TrimPrefix(props.Model, "bing-")
	prompt := props.Message[len(props.Message)-1].Content
	if err := conn.SendJSON(&ChatRequest{
		Prompt: prompt,
		Hash:   c.Secret,
		Model:  model,
	}); err != nil {
		return err
	}

	for {
		form := utils.ReadForm[ChatResponse](conn)
		if form == nil {
			return nil
		}

		if err := hook(form.Response); err != nil {
			return err
		}
	}
}
