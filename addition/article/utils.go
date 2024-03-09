package article

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/lukasjarosch/go-docx"
)

func GenerateDocxFile(target, title, content string) error {
	data := docx.PlaceholderMap{
		"title":   title,
		"content": content,
	}

	doc, err := docx.Open("addition/article/template.docx")
	if err != nil {
		return err
	}

	if err := doc.ReplaceAll(data); err != nil {
		return err
	}

	if err := doc.WriteToFile(target); err != nil {
		return err
	}

	return nil
}

func CreateArticleFile(hash, title, content string) string {
	target := fmt.Sprintf("storage/article/data/%s/%s.docx", hash, title)
	utils.FileDirSafe(target)
	if err := GenerateDocxFile(target, title, content); err != nil {
		globals.Debug(fmt.Sprintf("[article] error during generate article %s: %s", title, err.Error()))
	}

	return target
}
