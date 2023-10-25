package cli

import "fmt"

var Prompt = `
Commands:
	- help
	- invite <type> <num> <quota>
`

func Help() {
	fmt.Println(fmt.Sprintf("%s", Prompt))
}
