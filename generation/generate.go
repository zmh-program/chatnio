package generation

import (
	"chat/utils"
	"fmt"
)

func CreateGenerationWithCache(model string, prompt string, hook func(data string)) (string, string, error) {
	hash, path := GetFolderByHash(model, prompt)
	if !utils.Exists(path) {
		if err := CreateGeneration(model, prompt, path, func(data string) {
			hook(data)
		}); err != nil {
			fmt.Println(fmt.Sprintf("[Project] error during generation %s (model %s): %s", prompt, model, err.Error()))
			return "", "", fmt.Errorf("error during generate project: %s", err.Error())
		}
	}

	return utils.GenerateCompressTask(hash, path, path)
}
