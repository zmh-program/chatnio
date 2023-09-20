package generation

import (
	"chat/utils"
	"fmt"
)

func GetFolder(hash string) string {
	return fmt.Sprintf("generation/data/%s", hash)
}

func GetFolderByHash(model string, prompt string) (string, string) {
	hash := utils.Sha2Encrypt(model + prompt)
	return hash, GetFolder(hash)
}

func GenerateProject(path string, instance ProjectResult) bool {
	for name, data := range instance.Result {
		current := fmt.Sprintf("%s/%s", path, name)
		if content, ok := data.(string); ok {
			if !utils.WriteFile(current, content, true) {
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
