package adaptercommon

import (
	"chat/globals"
)

type Factory interface {
	CreateStreamChatRequest(props *ChatProps, hook globals.Hook) error
}

type FactoryCreator func(globals.ChannelConfig) Factory
