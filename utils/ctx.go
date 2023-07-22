package utils

import (
	"database/sql"
	"github.com/gin-gonic/gin"
)

func GetDBFromContext(c *gin.Context) *sql.DB {
	return c.MustGet("db").(*sql.DB)
}

func GetCacheFromContext(c *gin.Context) *sql.DB {
	return c.MustGet("cache").(*sql.DB)
}
