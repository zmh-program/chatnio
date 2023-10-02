package conversation

import (
	"chat/auth"
	"chat/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

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
