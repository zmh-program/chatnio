package generation

import (
	"chat/utils"
	"fmt"
	"time"
)

func GetFolder(hash string) string {
	return fmt.Sprintf("storage/generation/data/%s", hash)
}

func GetFolderByHash(model string, prompt string) (string, string) {
	hash := utils.Sha2Encrypt(model + prompt + time.Now().Format("2006-01-02 15:04:05"))
	return hash, GetFolder(hash)
}

func GenerateProject(path string, instance ProjectResult) bool {
	for name, data := range instance.Result {
		current := fmt.Sprintf("%s/%s", path, name)
		if content, ok := data.(string); ok {
			if utils.WriteFile(current, content, true) != nil {
				return false
			}
		} else {
			GenerateProject(current, ProjectResult{
				Result: data.(map[string]interface{}),
			})
		}
	}
	return true
}
