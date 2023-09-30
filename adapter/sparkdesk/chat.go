package sparkdesk

import (
	"chat/globals"
	"chat/utils"
	"fmt"
)

type ChatProps struct {
	Message []globals.Message
	Token   int
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocketClient(c.GenerateUrl()); conn == nil {
		return fmt.Errorf("sparkdesk error: websocket connection failed")
	}
	defer conn.DeferClose()

	if err := conn.SendJSON(&ChatRequest{
		Header: RequestHeader{
			AppId: c.AppId,
		},
		Payload: RequestPayload{
			Message: MessagePayload{
				Text: props.Message,
			},
		},
		Parameter: RequestParameter{
			Chat: ChatParameter{
				Domain:   c.Model,
				MaxToken: props.Token,
			},
		},
	}); err != nil {
		return err
	}

	for {
		form := utils.ReadForm[ChatResponse](conn)
		if form == nil {
			return nil
		}

		if form.Header.Code != 0 {
			return fmt.Errorf("sparkdesk error: %s (sid: %s)", form.Header.Message, form.Header.Sid)
		}

		if err := hook(form.Payload.Choices.Text[0].Content); err != nil {
			return err
		}
	}
}
