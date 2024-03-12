package cli

func Run() bool {
	args := GetArgs()
	if len(args) == 0 {
		return false
	}

	param := args[1:]
	switch args[0] {
	case "help":
		Help()
	case "invite":
		CreateInvitationCommand(param)
	case "token":
		CreateTokenCommand(param)
	case "root":
		UpdateRootCommand(param)
	default:
		return false
	}

	return true
}
