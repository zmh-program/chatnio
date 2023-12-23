package auth

import (
	"regexp"
	"strings"
)

func isInRange(content string, min, max int) bool {
	content = strings.TrimSpace(content)
	return len(content) >= min && len(content) <= max
}

func validateUsername(username string) bool {
	return isInRange(username, 2, 24)
}

func validateUsernameOrEmail(username string) bool {
	return isInRange(username, 1, 255)
}

func validatePassword(password string) bool {
	return isInRange(password, 6, 36)
}

func validateEmail(email string) bool {
	if !isInRange(email, 1, 255) {
		return false
	}

	exp := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return exp.MatchString(email)
}

func validateCode(code string) bool {
	return isInRange(code, 1, 64)
}
