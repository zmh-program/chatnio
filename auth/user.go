package auth

import (
	"chat/utils"
	"database/sql"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
	"net/http"
	"time"
)

type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	BindID   int64  `json:"bind_id"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type LoginForm struct {
	Token string `form:"token" binding:"required"`
}

func (u *User) Validate(c *gin.Context) bool {
	if u.Username == "" || u.Password == "" {
		return false
	}
	cache := c.MustGet("cache").(*redis.Client)

	if password, err := cache.Get(c, fmt.Sprintf("nio:user:%s", u.Username)).Result(); err == nil && len(password) > 0 {
		return u.Password == password
	}

	db := c.MustGet("db").(*sql.DB)
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE username = ? AND password = ?", u.Username, u.Password).Scan(&count); err != nil || count == 0 {
		return false
	}

	cache.Set(c, fmt.Sprintf("nio:user:%s", u.Username), u.Password, 30*time.Minute)
	return true
}

func (u *User) GenerateToken() string {
	instance := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": u.Username,
		"password": u.Password,
		"exp":      time.Now().Add(time.Hour * 24 * 30).Unix(),
	})
	token, err := instance.SignedString([]byte(viper.GetString("secret")))
	if err != nil {
		return ""
	}
	return token
}

func (u *User) GetID(db *sql.DB) int64 {
	if u.ID > 0 {
		return u.ID
	}
	if err := db.QueryRow("SELECT id FROM auth WHERE username = ?", u.Username).Scan(&u.ID); err != nil {
		return 0
	}
	return u.ID
}

func IsUserExist(db *sql.DB, username string) bool {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM auth WHERE username = ?", username).Scan(&count); err != nil {
		return false
	}
	return count > 0
}

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

func Login(c *gin.Context, token string) (bool, string) {
	// DeepTrain Token Validation
	user := Validate(token)
	if user == nil {
		return false, ""
	}

	db := c.MustGet("db").(*sql.DB)
	if !IsUserExist(db, user.Username) {
		// register
		password := utils.GenerateChar(64)
		_ = db.QueryRow("INSERT INTO auth (bind_id, username, token, password) VALUES (?, ?, ?, ?)",
			user.ID, user.Username, token, password)
		u := &User{
			Username: user.Username,
			Password: password,
		}
		return true, u.GenerateToken()
	}

	// login
	_ = db.QueryRow("UPDATE auth SET token = ? WHERE username = ?", token, user.Username)
	var password string
	err := db.QueryRow("SELECT password FROM auth WHERE username = ?", user.Username).Scan(&password)
	if err != nil {
		return false, ""
	}
	u := &User{
		Username: user.Username,
		Password: password,
	}
	return true, u.GenerateToken()
}

func LoginAPI(c *gin.Context) {
	var form LoginForm
	if err := c.ShouldBind(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "bad request",
		})
		return
	}

	state, token := Login(c, form.Token)
	if !state {
		c.JSON(http.StatusOK, gin.H{
			"status": false,
			"error":  "user not found",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status": true,
		"token":  token,
	})
}

func StateAPI(c *gin.Context) {
	username := c.MustGet("user").(string)
	c.JSON(http.StatusOK, gin.H{
		"status": len(username) != 0,
		"user":   username,
	})
}
