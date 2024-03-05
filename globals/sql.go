package globals

import (
	"database/sql"
	"regexp"
	"strings"
)

var SqliteEngine = false

type batch struct {
	Old   string
	New   string
	Regex bool
}

func batchReplace(sql string, batch []batch) string {
	for _, item := range batch {
		if item.Regex {
			sql = regexp.MustCompile(item.Old).ReplaceAllString(sql, item.New)
			continue
		}

		sql = strings.ReplaceAll(sql, item.Old, item.New)
	}
	return sql
}

func PreflightSql(sql string) string {
	// this is a simple way to adapt the sql to the sqlite engine
	// it's not a common way to use sqlite in production, just as polyfill

	if SqliteEngine {
		if strings.Contains(sql, "DUPLICATE KEY") {
			sql = batchReplace(sql, []batch{
				{
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = ?",
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET quota = ?",
					false,
				},
				{
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE used = ?",
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET used = ?",
					false,
				},
				{
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = quota + ?",
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET quota = quota + ?",
					false,
				},
				{
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE used = used + ?",
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET used = used + ?",
					false,
				},
				{
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quota = quota - ?",
					"INSERT INTO quota (user_id, quota, used) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET quota = quota - ?",
					false,
				},
			})
		}

		sql = batchReplace(sql, []batch{
			// KEYWORD REPLACEMENT
			{`INT `, `INTEGER `, false},
			{` AUTO_INCREMENT`, ` AUTOINCREMENT`, false},
			{`DATETIME`, `TEXT`, false},
			{`DECIMAL`, `REAL`, false},
			{`MEDIUMTEXT`, `TEXT`, false},
			{`VARCHAR`, `TEXT`, false},

			// TEXT(65535) -> TEXT, REAL(10,2) -> REAL
			{`TEXT\(\d+\)`, `TEXT`, true},
			{`REAL\(\d+,\d+\)`, `REAL`, true},

			// UNIQUE KEY -> UNIQUE
			{`UNIQUE KEY`, `UNIQUE`, false},
		})
	}

	return sql
}

func ExecDb(db *sql.DB, sql string, args ...interface{}) (sql.Result, error) {
	sql = PreflightSql(sql)
	return db.Exec(sql, args...)
}

func PrepareDb(db *sql.DB, sql string) (*sql.Stmt, error) {
	sql = PreflightSql(sql)
	return db.Prepare(sql)
}

func QueryDb(db *sql.DB, sql string, args ...interface{}) (*sql.Rows, error) {
	sql = PreflightSql(sql)
	return db.Query(sql, args...)
}

func QueryRowDb(db *sql.DB, sql string, args ...interface{}) *sql.Row {
	sql = PreflightSql(sql)
	return db.QueryRow(sql, args...)
}
