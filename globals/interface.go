package globals

type ChannelConfig interface {
	GetType() string
	GetModelReflect(model string) string
	GetRetry() int
	GetRandomSecret() string
	SplitRandomSecret(num int) []string
	GetEndpoint() string
	ProcessError(err error) error
}
