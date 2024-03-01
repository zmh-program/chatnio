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

func MultiSql(mysqlSql string, sqliteSql string) string {
	if SqliteEngine {
		return sqliteSql
	}
	return mysqlSql
}

func PreflightSql(sql string) string {
	if SqliteEngine {
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
