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

	model, _ := strings.CutPrefix(props.Model, "bing-")
	if err := conn.SendJSON(&ChatRequest{
		Prompt:  props.Message[len(props.Message)-1].Content,
		Cookies: c.Cookies,
		Model:   model,
	}); err != nil {
		return err
	}

	for {
		form := utils.ReadForm[ChatResponse](conn)
		if form == nil {
			return nil
		}

		if form.Error != "" && form.End {
			return fmt.Errorf("bing error: %s", form.Error)
		}

		if err := hook(form.Response); err != nil {
			return err
		}

		if len(form.Suggested) > 0 {
			message := ""
			for _, suggested := range form.Suggested {
				message += fmt.Sprintf("- %s\n", suggested)
			}

			if err := hook(fmt.Sprintf("\n\n%s", message)); err != nil {
				return err
			}
		}
	}
}
