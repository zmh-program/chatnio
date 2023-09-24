package generation

import (
	"chat/api"
	"chat/utils"
	"fmt"
)

func CreateGenerationWithCache(model string, prompt string, enableReverse bool, hook func(buffer *api.Buffer, data string)) (string, error) {
	hash, path := GetFolderByHash(model, prompt)
	if !utils.Exists(path) {
		if err := CreateGeneration(model, prompt, path, enableReverse, hook); err != nil {
			fmt.Println(fmt.Sprintf("[Project] error during generation %s (model %s): %s", prompt, model, err.Error()))
			return "", fmt.Errorf("error during generate project: %s", err.Error())
		}
	}

	if _, _, err := utils.GenerateCompressTask(hash, path, path); err != nil {
		return "", fmt.Errorf("error during generate compress task: %s", err.Error())
	}

	return hash, nil
}
