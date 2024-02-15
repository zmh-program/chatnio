package palm2

import (
	"chat/globals"
	"chat/utils"
	"strings"
)

func getGeminiRole(role string) string {
	switch role {
	case globals.User:
		return GeminiUserType
	case globals.Assistant, globals.Tool, globals.System:
		return GeminiModelType
	default:
		return GeminiUserType
	}
}

func getMimeType(content string) string {
	segment := strings.Split(content, ".")
	if len(segment) == 0 || len(segment) == 1 {
		return "image/png"
	}

	suffix := strings.TrimSpace(strings.ToLower(segment[len(segment)-1]))

	switch suffix {
	case "png":
		return "image/png"
	case "jpg", "jpeg":
		return "image/jpeg"
	case "gif":
		return "image/gif"
	case "webp":
		return "image/webp"
	case "heif":
		return "image/heif"
	case "heic":
		return "image/heic"
	default:
		return "image/png"
	}
}

func getGeminiContent(parts []GeminiChatPart, content string, model string) []GeminiChatPart {
	if model == globals.GeminiPro {
		return append(parts, GeminiChatPart{
			Text: &content,
		})
	}

	raw, urls := utils.ExtractImages(content, true)
	if len(urls) > geminiMaxImages {
		urls = urls[:geminiMaxImages]
	}

	parts = append(parts, GeminiChatPart{
		Text: &raw,
	})

	for _, url := range urls {
		data, err := utils.ConvertToBase64(url)
		if err != nil {
			continue
		}

		parts = append(parts, GeminiChatPart{
			InlineData: &GeminiInlineData{
				MimeType: getMimeType(url),
				Data:     data,
			},
		})
	}

	return parts
}

func (c *ChatInstance) GetGeminiContents(model string, message []globals.Message) []GeminiContent {
	// gemini role should be user-model

	result := make([]GeminiContent, 0)
	for _, item := range message {
		role := getGeminiRole(item.Role)
		if len(item.Content) == 0 {
			// gemini model: message must include non empty content
			continue
		}

		if len(result) == 0 && getGeminiRole(item.Role) == GeminiModelType {
			// gemini model: first message must be user

			result = append(result, GeminiContent{
				Role:  GeminiUserType,
				Parts: getGeminiContent(make([]GeminiChatPart, 0), "", model),
			})
		}

		if len(result) > 0 && role == result[len(result)-1].Role {
			// gemini model: messages must alternate between authors
			result[len(result)-1].Parts = getGeminiContent(result[len(result)-1].Parts, item.Content, model)
			continue
		}

		result = append(result, GeminiContent{
			Role:  getGeminiRole(item.Role),
			Parts: getGeminiContent(make([]GeminiChatPart, 0), item.Content, model),
		})
	}

	return result
}
