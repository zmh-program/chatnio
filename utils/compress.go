package utils

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"strings"
)

func GenerateCompressTask(hash string, base, path, replacer string) (string, string, error) {
	base = handlePath(base)
	replacer = handlePath(replacer)

	CreateFolder(base)
	zipPath := fmt.Sprintf("%s/%s.zip", base, hash)
	gzipPath := fmt.Sprintf("%s/%s.tar.gz", base, hash)

	files := Walk(path)

	if err := CreateZipObject(zipPath, files, replacer); err != nil {
		return "", "", err
	}

	if err := CreateGzipObject(gzipPath, files, replacer); err != nil {
		return "", "", err
	}

	return zipPath, gzipPath, nil
}

func GenerateCompressTaskAsync(hash string, base, path, replacer string) (string, string) {
	zipPath := fmt.Sprintf("%s/%s.zip", base, hash)
	gzipPath := fmt.Sprintf("%s/%s.tar.gz", base, hash)

	files := Walk(path)

	go func() {
		if err := CreateZipObject(zipPath, files, replacer); err != nil {
			return
		}
	}()

	go func() {
		if err := CreateGzipObject(gzipPath, files, replacer); err != nil {
			return
		}
	}()

	return zipPath, gzipPath
}

func handlePath(path string) string {
	return strings.Replace(path, "\\", "/", -1)
}

func CreateZipObject(output string, files []string, replacer string) error {
	FileDirSafe(output)
	file, err := os.Create(output)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := zip.NewWriter(file)
	defer writer.Close()

	for _, file := range files {
		err := addFileToZip(writer, file, replacer)
		if err != nil {
			return err
		}
	}

	return nil
}

func addFileToZip(zipWriter *zip.Writer, path string, replacer string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}
	header.Name = strings.Trim(strings.Replace(path, replacer, "", 1), "/")
	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}
	_, err = io.Copy(writer, file)
	if err != nil {
		return err
	}

	return nil
}

func CreateGzipObject(output string, files []string, replacer string) error {
	FileDirSafe(output)
	tarFile, err := os.Create(output)
	if err != nil {
		return err
	}
	defer tarFile.Close()

	gzWriter := gzip.NewWriter(tarFile)
	defer gzWriter.Close()

	tarWriter := tar.NewWriter(gzWriter)
	defer tarWriter.Close()

	for _, file := range files {
		err := addFileToTar(tarWriter, file, replacer)
		if err != nil {
			return err
		}
	}

	return nil
}

// tar gzip
func addFileToTar(tarWriter *tar.Writer, filePath string, replacer string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}

	header, err := tar.FileInfoHeader(info, "")
	if err != nil {
		return err
	}

	header.Name = strings.Trim(strings.Replace(filePath, replacer, "", 1), "/")

	err = tarWriter.WriteHeader(header)
	if err != nil {
		return err
	}

	_, err = io.Copy(tarWriter, file)
	if err != nil {
		return err
	}

	return nil
}
