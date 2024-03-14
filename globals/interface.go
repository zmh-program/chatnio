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
	GetId() int
	GetProxy() ProxyConfig
}

type AuthLike interface {
	GetID(db *sql.DB) int64
	HitID() int64
}
