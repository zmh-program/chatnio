package cli

import (
	"chat/auth"
	"chat/connection"
	"fmt"
	"strings"
)

func CreateInvitationCommand(args []string) {
	db := connection.ConnectDatabase()

	var (
		t     = GetArgString(args, 0)
		num   = GetArgInt(args, 1)
		quota = GetArgFloat32(args, 2)
	)

	resp, err := auth.GenerateInvitations(db, num, quota, t)
	if err != nil {
		outputError(err)
		return
	}

	outputInfo("invite", fmt.Sprintf("%d invitation codes generated", len(resp)))
	fmt.Println(strings.Join(resp, "\n"))
}
