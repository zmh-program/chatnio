package connection

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/spf13/viper"
	"log"
)

var _ *sql.DB

func ConnectMySQL() *sql.DB {
	// connect to MySQL
	db, err := sql.Open("mysql", fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s",
		viper.GetString("mysql.user"),
		viper.GetString("mysql.password"),
		viper.GetString("mysql.host"),
		viper.GetInt("mysql.port"),
		viper.GetString("mysql.db"),
	))
	if err != nil {
		log.Fatalln("Failed to connect to MySQL server: ", err)
	} else {
		log.Println("Connected to MySQL server successfully")
	}

	CreateUserTable(db)
	CreateConversationTable(db)
	CreateSharingTable(db)
	CreatePackageTable(db)
	CreateQuotaTable(db)
	CreateSubscriptionTable(db)
	CreateApiKeyTable(db)
	CreateInvitationTable(db)
	return db
}

func CreateUserTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS auth (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  bind_id INT UNIQUE,
		  username VARCHAR(24) UNIQUE,
		  token VARCHAR(255) NOT NULL,
		  password VARCHAR(64) NOT NULL
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreatePackageTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS package (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  user_id INT,
		  type VARCHAR(255),
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  FOREIGN KEY (user_id) REFERENCES auth(id),
		  UNIQUE KEY (user_id, type)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateQuotaTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS quota (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  user_id INT UNIQUE,
		  quota DECIMAL(10, 4),
		  used DECIMAL(10, 4),
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  FOREIGN KEY (user_id) REFERENCES auth(id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateConversationTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS conversation (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  user_id INT,
		  conversation_id INT,
		  conversation_name VARCHAR(255),
		  data TEXT,
		  model VARCHAR(255) NOT NULL DEFAULT 'gpt-3.5-turbo',
		  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  UNIQUE KEY (user_id, conversation_id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateSharingTable(db *sql.DB) {
	// refs is an array of message id, separated by comma (-1 means all messages)
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS sharing (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  hash CHAR(32) UNIQUE,
		  user_id INT,
		  conversation_id INT,
		  refs TEXT,
		  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  FOREIGN KEY (user_id) REFERENCES auth(id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateSubscriptionTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS subscription (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  user_id INT UNIQUE,
		  expired_at DATETIME,
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  total_month INT DEFAULT 0,
		  enterprise BOOLEAN DEFAULT FALSE,
		  FOREIGN KEY (user_id) REFERENCES auth(id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateApiKeyTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS apikey (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  user_id INT UNIQUE,
		  api_key VARCHAR(255) UNIQUE,
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  FOREIGN KEY (user_id) REFERENCES auth(id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CreateInvitationTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS invitation (
		  id INT PRIMARY KEY AUTO_INCREMENT,
		  code VARCHAR(255) UNIQUE,
		  quota DECIMAL(6, 4),
		  type VARCHAR(255),
		  used BOOLEAN DEFAULT FALSE,
		  used_id INT,
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  UNIQUE KEY (used_id, type),
		  FOREIGN KEY (used_id) REFERENCES auth(id)
		);
	`)
	if err != nil {
		log.Fatal(err)
	}
}
