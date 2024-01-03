package cli

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

func GetArgs() []string {
	return os.Args[1:]
}

func GetArg(args []string, idx int) string {
	if len(args) <= idx {
		log.Fatalln(fmt.Sprintf("not enough arguments: %d", idx))
	}
	return args[idx]
}

func GetArgInt(args []string, idx int) int {
	i, err := strconv.Atoi(GetArg(args, idx))
	if err != nil {
		log.Fatalln(fmt.Sprintf("invalid argument: %s", err.Error()))
	}
	return i
}

func GetArgFloat(args []string, idx int, bitSize int) float64 {
	f, err := strconv.ParseFloat(GetArg(args, idx), bitSize)
	if err != nil {
		log.Fatalln(fmt.Sprintf("invalid argument: %s", err.Error()))
	}
	return f
}

func GetArgFloat32(args []string, idx int) float32 {
	return float32(GetArgFloat(args, idx, 32))
}

func GetArgFloat64(args []string, idx int) float64 {
	return GetArgFloat(args, idx, 64)
}

func GetArgBool(args []string, idx int) bool {
	b, err := strconv.ParseBool(GetArg(args, idx))
	if err != nil {
		log.Fatalln(fmt.Sprintf("invalid argument: %s", err.Error()))
	}
	return b
}

func GetArgInt64(args []string, idx int) int64 {
	i, err := strconv.ParseInt(GetArg(args, idx), 10, 64)
	if err != nil {
		log.Fatalln(fmt.Sprintf("invalid argument: %s", err.Error()))
	}
	return i
}

func GetArgString(args []string, idx int) string {
	return GetArg(args, idx)
}

func outputError(err error) {
	fmt.Println(fmt.Sprintf("\033[31m[cli] error: %s\033[0m", err.Error()))
}

func outputInfo(t, msg string) {
	fmt.Println(fmt.Sprintf("[cli] %s: %s", t, msg))
}
