package cli

import "fmt"

var Prompt = `
Commands:
	- help
	- invite <type> <num> <quota>
	- token <user-id>
	- root <password>
`

func Help() {
	fmt.Println(fmt.Sprintf("%s", Prompt))
}
