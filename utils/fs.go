package utils

import (
	"fmt"
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

func CreateFolderNotExists(path string) string {
	CreateFolder(path)
	return path
}

func CreateFolderOnFile(file string) string {
	return CreateFolderNotExists(file[:strings.LastIndex(file, "/")])
}

func WriteFile(path string, data string, folderSafe bool) bool {
	if folderSafe {
		CreateFolderOnFile(path)
	}

	file, err := os.Create(path)
	if err != nil {
		return false
	}
	defer file.Close()

	if _, err := file.WriteString(data); err != nil {
		fmt.Println(err.Error())
		return false
	}
	return true
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
