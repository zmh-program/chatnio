package cli

import "fmt"

var Prompt = `
Commands:
	- help
	- invite <type> <num> <quota>
	- token <user-id>
`

func Help() {
	fmt.Println(fmt.Sprintf("%s", Prompt))
}
