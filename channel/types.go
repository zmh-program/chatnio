package channel

type Channel struct {
	Id        int                `json:"id" mapstructure:"id"`
	Name      string             `json:"name" mapstructure:"name"`
	Type      string             `json:"type" mapstructure:"type"`
	Priority  int                `json:"priority" mapstructure:"priority"`
	Weight    int                `json:"weight" mapstructure:"weight"`
	Models    []string           `json:"models" mapstructure:"models"`
	Retry     int                `json:"retry" mapstructure:"retry"`
	Secret    string             `json:"secret" mapstructure:"secret"`
	Endpoint  string             `json:"endpoint" mapstructure:"endpoint"`
	Mapper    string             `json:"mapper" mapstructure:"mapper"`
	State     bool               `json:"state" mapstructure:"state"`
	Reflect   *map[string]string `json:"-"`
	HitModels *[]string          `json:"-"`
}

type Sequence []*Channel

type Manager struct {
	Sequence          Sequence            `json:"sequence"`
	PreflightSequence map[string]Sequence `json:"preflight_sequence"`
	Models            []string            `json:"models"`
}

type Ticker struct {
	Sequence Sequence `json:"sequence"`
	Cursor   int      `json:"cursor"`
}
