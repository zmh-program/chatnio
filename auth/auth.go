package auth

import (
	"chat/globals"
	"chat/utils"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"time"
)

func ParseToken(c *gin.Context, token string) *User {
	instance, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(viper.GetString("secret")), nil
	})
	if err != nil {
		return nil
	}
	if claims, ok := instance.Claims.(jwt.MapClaims); ok && instance.Valid {
		if int64(claims["exp"].(float64)) < time.Now().Unix() {
			return nil
		}
		user := &User{
			Username: claims["username"].(string),
			Password: claims["password"].(string),
		}
		if !user.Validate(c) {
			return nil
		}
		return user
	}
	return nil
}

func ParseApiKey(c *gin.Context, key string) *User {
	db := utils.GetDBFromContext(c)

	if len(key) == 0 {
		return nil
	}

	var user User
	if err := db.QueryRow(`
			SELECT auth.id, auth.username, auth.password FROM auth 
			INNER JOIN apikey ON auth.id = apikey.user_id 
			WHERE apikey.api_key = ?
			`, key).Scan(&user.ID, &user.Username, &user.Password); err != nil {
		return nil
	}

	return &user
}

func Login(c *gin.Context, token string) (string, error) {
	user := Validate(token)
	if user == nil {
		return "", errors.New("cannot validate access token")
	}

	db := utils.GetDBFromContext(c)
	if !IsUserExist(db, user.Username) {
		// register
		password := utils.GenerateChar(64)
		_ = db.QueryRow("INSERT INTO auth (bind_id, username, token, password) VALUES (?, ?, ?, ?)",
			user.ID, user.Username, token, password)
		u := &User{
			Username: user.Username,
			Password: password,
		}
		return u.GenerateToken()
	}

	// login
	_ = db.QueryRow("UPDATE auth SET token = ? WHERE username = ?", token, user.Username)
	var password string
	err := db.QueryRow("SELECT password FROM auth WHERE username = ?", user.Username).Scan(&password)
	if err != nil {
		return "", err
	}
	u := &User{
		Username: user.Username,
		Password: password,
	}
	return u.GenerateToken()
}

func (u *User) Validate(c *gin.Context) bool {
	if u.Username == "" || u.Password == "" {
		return false
	}
	cache := utils.GetCacheFromContext(c)

	if password, err := cache.Get(c, fmt.Sprintf("nio:user:%s", u.Username)).Result(); err == nil && len(password) > 0 {
		return u.Password == password
	}

	db := utils.GetDBFromContext(c)
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE username = ? AND password = ?", u.Username, u.Password).Scan(&count); err != nil || count == 0 {
		if err != nil {
			globals.Warn(fmt.Sprintf("validate user error: %s", err.Error()))
		}
		return false
	}

	cache.Set(c, fmt.Sprintf("nio:user:%s", u.Username), u.Password, 30*time.Minute)
	return true
}

func (u *User) GenerateToken() (string, error) {
	instance := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": u.Username,
		"password": u.Password,
		"exp":      time.Now().Add(time.Hour * 24 * 30).Unix(),
	})
	token, err := instance.SignedString([]byte(viper.GetString("secret")))
	if err != nil {
		return "", err
	} else if token == "" {
		return "", errors.New("unable to generate token")
	}
	return token, nil
}

func (u *User) GenerateTokenSafe(db *sql.DB) (string, error) {
	if len(u.Username) == 0 {
		if err := db.QueryRow("SELECT username FROM auth WHERE id = ?", u.ID).Scan(&u.Username); err != nil {
			return "", err
		}
	}

	if len(u.Password) == 0 {
		if err := db.QueryRow("SELECT password FROM auth WHERE id = ?", u.ID).Scan(&u.Password); err != nil {
			return "", err
		}
	}

	return u.GenerateToken()
}
