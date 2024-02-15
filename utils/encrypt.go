package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	crand "crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"io"
)

func Sha2Encrypt(raw string) string {
	// return 64-bit hash
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func Sha2EncryptForm(form interface{}) string {
	// return 64-bit hash
	hash := sha256.Sum256([]byte(ToJson(form)))
	return hex.EncodeToString(hash[:])
}

func Base64Encode(raw string) string {
	return base64.StdEncoding.EncodeToString([]byte(raw))
}

func Base64EncodeBytes(raw []byte) string {
	return base64.StdEncoding.EncodeToString(raw)
}

func Base64Decode(raw string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(raw)
}

func Base64DecodeBytes(raw string) []byte {
	if data, err := base64.StdEncoding.DecodeString(raw); err == nil {
		return data
	} else {
		return []byte{}
	}
}

func Md5Encrypt(raw string) string {
	// return 32-bit hash
	hash := md5.Sum([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func Md5EncryptForm(form interface{}) string {
	// return 32-bit hash
	hash := md5.Sum([]byte(ToJson(form)))
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
