package cli

import (
	"chat/auth"
	"chat/connection"
	"fmt"
	"strconv"
)

func CreateTokenCommand(args []string) {
	db := connection.ConnectDatabase()
	id, _ := strconv.Atoi(args[0])

	user := auth.GetUserById(db, int64(id))
	token, err := user.GenerateTokenSafe(db)
	if err != nil {
		outputError(err)
		return
	}

	outputInfo("token", "token generated")
	fmt.Println(token)
}
