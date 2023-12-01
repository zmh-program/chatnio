package channel

type Channel struct {
	Id       int      `json:"id"`
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Priority int      `json:"priority"`
	Weight   int      `json:"weight"`
	Models   []string `json:"models"`
	Retry    int      `json:"retry"`
	Secret   string   `json:"secret"`
	Endpoint string   `json:"endpoint"`
	Mapper   string   `json:"mapper"`
	State    bool     `json:"state"`

	Reflect   *map[string]string `json:"reflect"`
	HitModels *[]string          `json:"hit_models"`
}

type Sequence []*Channel

type Manager struct {
	Sequence Sequence `json:"sequence"`
}
