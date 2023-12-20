package generation

import (
	"chat/globals"
	"chat/utils"
	"fmt"
)

func CreateGenerationWithCache(group, model, prompt string, enableReverse bool, hook func(buffer *utils.Buffer, data string)) (string, error) {
	hash, path := GetFolderByHash(model, prompt)
	if !utils.Exists(path) {
		if err := CreateGeneration(group, model, prompt, path, enableReverse, hook); err != nil {
			globals.Info(fmt.Sprintf("[project] error during generation %s (model %s): %s", prompt, model, err.Error()))
			return "", fmt.Errorf("error during generate project: %s", err.Error())
		}
	}

	if _, _, err := utils.GenerateCompressTask(hash, "addition/generation/data/out", path, path); err != nil {
		return "", fmt.Errorf("error during generate compress task: %s", err.Error())
	}

	return hash, nil
}
