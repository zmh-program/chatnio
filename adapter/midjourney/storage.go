package midjourney

import (
	"chat/connection"
	"chat/utils"
	"fmt"
)

func getTaskName(task string) string {
	return fmt.Sprintf("nio:mj-task:%s", task)
}

func setStorage(task string, form StorageForm) error {
	return utils.SetJson(connection.Cache, getTaskName(task), form, 60*60)
}

func getNotifyStorage(task string) *StorageForm {
	return utils.GetCacheStore[StorageForm](connection.Cache, getTaskName(task))
}
