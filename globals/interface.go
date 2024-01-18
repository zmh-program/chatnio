package globals

import "database/sql"

type ChannelConfig interface {
	GetType() string
	GetModelReflect(model string) string
	GetRetry() int
	GetRandomSecret() string
	SplitRandomSecret(num int) []string
	GetEndpoint() string
	ProcessError(err error) error
}

type AuthLike interface {
	GetID(db *sql.DB) int64
	HitID() int64
}
