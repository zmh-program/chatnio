package utils

import (
	"crypto/aes"
	"crypto/cipher"
	crand "crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"io"
)

func Sha2Encrypt(raw string) string {
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func Md5Encrypt(raw string) string {
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func AES256Encrypt(key string, data string) (string, error) {
	text := []byte(data)
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}

	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(crand.Reader, iv); err != nil {
		return "", err
	}

	encryptor := cipher.NewCFBEncrypter(block, iv)

	ciphertext := make([]byte, len(text))
	encryptor.XORKeyStream(ciphertext, text)
	return hex.EncodeToString(ciphertext), nil
}

func AES256Decrypt(key string, data string) (string, error) {
	ciphertext, err := hex.DecodeString(data)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	decryptor := cipher.NewCFBDecrypter(block, iv)
	plaintext := make([]byte, len(ciphertext))
	decryptor.XORKeyStream(plaintext, ciphertext)

	return string(plaintext), nil
}
