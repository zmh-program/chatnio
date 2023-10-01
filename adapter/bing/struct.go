package bing

import (
	"chat/globals"
)

type ChatInstance struct {
	Endpoint string
	Cookies  map[string]string
}

type ChatProps struct {
	Message []globals.Message
}
