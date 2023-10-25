package cli

func Run() bool {
	args := GetArgs()
	if len(args) == 0 {
		return false
	}

	switch args[0] {
	case "help":
		Help()
		return true
	case "invite":
		CreateInvitationCommand(args[1:])
		return true
	default:
		return false
	}
}
