package conversation

import (
	"chat/auth"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

type ShareForm struct {
	Id   int64 `json:"id"`
	Refs []int `json:"refs"`
}

func ListAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	conversations := LoadConversationList(db, user.GetID(db))
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
		"data":    conversations,
	})
}

func LoadAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	id, err := strconv.ParseInt(c.Query("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "invalid id",
		})
		return
	}
	conversation := LoadConversation(db, user.GetID(db), id)
	if conversation == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "conversation not found",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
		"data":    conversation,
	})
}

func DeleteAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	id, err := strconv.ParseInt(c.Query("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "invalid id",
		})
		return
	}
	conversation := LoadConversation(db, user.GetID(db), id)
	if conversation == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "conversation not found",
		})
		return
	}
	conversation.DeleteConversation(db)
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
	})
}

func CleanAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	if err := DeleteAllConversations(db, *user); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
	})
}

func ShareAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	var form ShareForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "invalid form",
		})
		return
	}

	if hash, err := ShareConversation(db, user, form.Id, form.Refs); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status":  true,
			"message": "",
			"data":    hash,
		})
	}
}

func ViewAPI(c *gin.Context) {
	db := utils.GetDBFromContext(c)
	hash := strings.TrimSpace(c.Query("hash"))
	if hash == "" {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "invalid hash",
		})
		return
	}

	shared, err := GetSharedConversation(db, hash)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
		"data":    shared,
	})
}

func ListSharingAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	data := ListSharedConversation(db, user)
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
		"data":    data,
	})
}

func DeleteSharingAPI(c *gin.Context) {
	user := auth.GetUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "user not found",
		})
		return
	}

	db := utils.GetDBFromContext(c)
	hash := strings.TrimSpace(c.Query("hash"))
	if hash == "" {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": "invalid hash",
		})
		return
	}

	if err := DeleteSharedConversation(db, user, hash); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"message": "",
	})
}
