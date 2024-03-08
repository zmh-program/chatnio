package utils

import (
	"bufio"
	"chat/globals"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func CreateFolder(path string) bool {
	if err := os.MkdirAll(path, os.ModePerm); err != nil && !os.IsExist(err) {
		return false
	}
	return true
}

func Exists(path string) bool {
	err := os.Mkdir(path, os.ModePerm)
	return err != nil && os.IsExist(err)
}

func DirSafe(path string) string {
	CreateFolder(path)
	return path
}

func FileDirSafe(file string) string {
	if strings.LastIndex(file, "/") == -1 {
		return file
	}

	return DirSafe(file[:strings.LastIndex(file, "/")])
}

func FileSafe(file string) string {
	FileDirSafe(file)
	return file
}

func WriteFile(path string, data string, folderSafe bool) error {
	if folderSafe {
		FileDirSafe(path)
	}

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), path))
		}
	}(file)

	if _, err := file.WriteString(data); err != nil {
		globals.Warn(fmt.Sprintf("[utils] write file error: %s (path: %s, bytes len: %d)", err.Error(), path, len(data)))
		return err
	}
	return nil
}

func ReadFile(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}

	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), path))
		}
	}(file)

	data, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func Walk(path string) []string {
	var files []string
	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() {
			files = append(files, handlePath(path))
		}
		return nil
	})
	if err != nil {
		return nil
	}
	return files
}

func GetFileSize(path string) int64 {
	file, err := os.Open(path)
	if err != nil {
		return 0
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), path))
		}
	}(file)

	stat, err := file.Stat()
	if err != nil {
		return 0
	}
	return stat.Size()
}

func GetFileCreated(path string) string {
	file, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), path))
		}
	}(file)

	stat, err := file.Stat()
	if err != nil {
		return ""
	}
	return stat.ModTime().String()
}

func IsFileExist(path string) bool {
	_, err := os.Stat(path)
	return err == nil || os.IsExist(err)
}

func CopyFile(src string, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer func(in *os.File) {
		err := in.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), src))
		}
	}(in)

	FileDirSafe(dst)
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer func(out *os.File) {
		err := out.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), dst))
		}
	}(out)

	_, err = io.Copy(out, in)
	return err
}

func DeleteFile(path string) error {
	return os.Remove(path)
}

func ReadFileLatestLines(path string, length int) (string, error) {
	if length <= 0 {
		return "", errors.New("length must be greater than 0")
	}

	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Warn(fmt.Sprintf("[utils] close file error: %s (path: %s)", err.Error(), path))
		}
	}(file)

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	if len(lines) < length {
		length = len(lines)
	}

	return strings.Join(lines[len(lines)-length:], "\n"), nil
}
