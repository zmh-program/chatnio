package channel

import (
	"chat/utils"
	"github.com/spf13/viper"
)

type generalState struct {
	Backend string `json:"backend" mapstructure:"backend"`
}

type mailState struct {
	Host     string `json:"host" mapstructure:"host"`
	Port     int    `json:"port" mapstructure:"port"`
	Username string `json:"username" mapstructure:"username"`
	Password string `json:"password" mapstructure:"password"`
	From     string `json:"from" mapstructure:"from"`
}

type searchState struct {
	Endpoint string `json:"endpoint" mapstructure:"endpoint"`
	Query    int    `json:"query" mapstructure:"query"`
}

type SystemConfig struct {
	General generalState `json:"general" mapstructure:"general"`
	Mail    mailState    `json:"mail" mapstructure:"mail"`
	Search  searchState  `json:"search" mapstructure:"search"`
}

func NewSystemConfig() *SystemConfig {
	conf := &SystemConfig{}
	if err := viper.UnmarshalKey("system", conf); err != nil {
		panic(err)
	}

	return conf
}

func (c *SystemConfig) SaveConfig() error {
	viper.Set("system", c)

	// fix: import cycle not allowed
	{
		viper.Set("system.general.backend", c.GetBackend())
	}
	return viper.WriteConfig()
}

func (c *SystemConfig) UpdateConfig(data *SystemConfig) error {
	c.General = data.General
	c.Mail = data.Mail
	c.Search = data.Search

	return c.SaveConfig()
}

func (c *SystemConfig) GetBackend() string {
	return c.General.Backend
}

func (c *SystemConfig) GetMail() *utils.SmtpPoster {
	return utils.NewSmtpPoster(
		c.Mail.Host,
		c.Mail.Port,
		c.Mail.Username,
		c.Mail.Password,
		c.Mail.From,
	)
}

func (c *SystemConfig) GetSearchEndpoint() string {
	if len(c.Search.Endpoint) == 0 {
		return "https://duckduckgo-api.vercel.app"
	}

	return c.Search.Endpoint
}

func (c *SystemConfig) GetSearchQuery() int {
	if c.Search.Query <= 0 {
		return 5
	}

	return c.Search.Query
}
