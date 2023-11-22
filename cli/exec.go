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
		return true
	case "invite":
		CreateInvitationCommand(param)
		return true
	case "filter":
		FilterApiKeyCommand(param)
		return true
	case "token":
		CreateTokenCommand(param)
		return true
	default:
		return false
	}
}
