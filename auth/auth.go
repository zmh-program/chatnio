package auth

import (
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"strings"
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

func getCode(c *gin.Context, cache *redis.Client, email string) string {
	code, err := cache.Get(c, fmt.Sprintf("nio:otp:%s", email)).Result()
	if err != nil {
		return ""
	}
	return code
}

func checkCode(c *gin.Context, cache *redis.Client, email, code string) bool {
	storage := getCode(c, cache, email)
	if len(storage) == 0 {
		return false
	}

	if storage != code {
		return false
	}

	cache.Del(c, fmt.Sprintf("nio:top:%s", email))
	return true
}

func setCode(c *gin.Context, cache *redis.Client, email, code string) {
	cache.Set(c, fmt.Sprintf("nio:otp:%s", email), code, 5*time.Minute)
}

func generateCode(c *gin.Context, cache *redis.Client, email string) string {
	code := utils.GenerateCode(6)
	setCode(c, cache, email, code)
	return code
}

func Verify(c *gin.Context, email string) error {
	cache := utils.GetCacheFromContext(c)
	code := generateCode(c, cache, email)

	return channel.SystemInstance.SendVerifyMail(email, code)
}

func SignUp(c *gin.Context, form RegisterForm) (string, error) {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	username := strings.TrimSpace(form.Username)
	password := strings.TrimSpace(form.Password)
	email := strings.TrimSpace(form.Email)
	code := strings.TrimSpace(form.Code)

	if !utils.All(
		validateUsername(username),
		validatePassword(password),
		validateEmail(email),
		validateCode(code),
	) {
		return "", errors.New("invalid username/password/email format")
	}

	if err := channel.SystemInstance.IsValidMail(form.Email); err != nil {
		return "", err
	}

	if IsUserExist(db, username) {
		return "", fmt.Errorf("username is already taken, please try another one username (your current username: %s)", username)
	}

	if IsEmailExist(db, email) {
		return "", fmt.Errorf("email is already taken, please try another one email (your current email: %s)", email)
	}

	if !checkCode(c, cache, email, code) {
		return "", errors.New("invalid email verification code")
	}

	hash := utils.Sha2Encrypt(password)

	user := &User{
		Username: username,
		Password: hash,
		Email:    email,
		BindID:   getMaxBindId(db) + 1,
		Token:    utils.Sha2Encrypt(email + username),
	}

	if _, err := db.Exec(`
			INSERT INTO auth (username, password, email, bind_id, token)
			VALUES (?, ?, ?, ?, ?)
			`, user.Username, user.Password, user.Email, user.BindID, user.Token); err != nil {
		return "", err
	}

	user.CreateInitialQuota(db)
	return user.GenerateToken()
}

func Login(c *gin.Context, form LoginForm) (string, error) {
	db := utils.GetDBFromContext(c)
	username := strings.TrimSpace(form.Username)
	password := strings.TrimSpace(form.Password)

	if !utils.All(
		validateUsernameOrEmail(username),
		validatePassword(password),
	) {
		return "", errors.New("invalid username or password format")
	}

	hash := utils.Sha2Encrypt(password)

	// get user from db by username (or email) and password
	var user User
	if err := db.QueryRow(`
			SELECT auth.id, auth.username, auth.password FROM auth 
			WHERE (auth.username = ? OR auth.email = ?) AND auth.password = ?
			`, username, username, hash).Scan(&user.ID, &user.Username, &user.Password); err != nil {
		return "", errors.New("invalid username or password")
	}

	return user.GenerateToken()
}

func DeepLogin(c *gin.Context, token string) (string, error) {
	if !useDeeptrain() {
		return "", errors.New("deeptrain mode is disabled")
	}

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

		u.CreateInitialQuota(db)
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

func Reset(c *gin.Context, form ResetForm) error {
	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	email := strings.TrimSpace(form.Email)
	code := strings.TrimSpace(form.Code)
	password := strings.TrimSpace(form.Password)

	if !utils.All(
		validateEmail(email),
		validateCode(code),
		validatePassword(password),
	) {
		return errors.New("invalid email/code/password format")
	}

	if !IsEmailExist(db, email) {
		return errors.New("email is not registered")
	}

	if !checkCode(c, cache, email, code) {
		return errors.New("invalid email verification code")
	}

	user := GetUserByEmail(db, email)
	if user == nil {
		return errors.New("cannot find user by email")
	}

	if err := user.UpdatePassword(db, cache, password); err != nil {
		return err
	}

	cache.Del(c, fmt.Sprintf("nio:otp:%s", email))

	return nil
}

func (u *User) UpdatePassword(db *sql.DB, cache *redis.Client, password string) error {
	hash := utils.Sha2Encrypt(password)

	if _, err := db.Exec(`
			UPDATE auth SET password = ? WHERE id = ?
			`, hash, u.ID); err != nil {
		return err
	}

	cache.Del(context.Background(), fmt.Sprintf("nio:user:%s", u.Username))

	return nil
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
