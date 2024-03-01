package cli

import (
	"chat/admin"
	"chat/connection"
	"errors"
)

func UpdateRootCommand(args []string) {
	db := connection.ConnectDatabase()
	cache := connection.ConnectRedis()

	if len(args) == 0 {
		outputError(errors.New("invalid arguments, please provide a new root password"))
		return
	}

	password := args[0]
	if err := admin.UpdateRootPassword(db, cache, password); err != nil {
		outputError(err)
		return
	}

	outputInfo("root", "root password updated")
}
