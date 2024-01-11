package channel

import (
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type ApiInfo struct {
	Title string `json:"title"`
	Logo  string `json:"logo"`
	File  string `json:"file"`
	Docs  string `json:"docs"`
}

type generalState struct {
	Title   string `json:"title" mapstructure:"title,omitempty"`
	Logo    string `json:"logo" mapstructure:"logo,omitempty"`
	Backend string `json:"backend" mapstructure:"backend"`
	File    string `json:"file" mapstructure:"file"`
	Docs    string `json:"docs" mapstructure:"docs"`
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
		viper.Set("system.general.title", c.General.Title)
		viper.Set("system.general.logo", c.General.Logo)
	}
	return viper.WriteConfig()
}

func (c *SystemConfig) AsInfo() ApiInfo {
	return ApiInfo{
		Title: c.General.Title,
		Logo:  c.General.Logo,
		File:  c.General.File,
		Docs:  c.General.Docs,
	}
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

func (c *SystemConfig) SendVerifyMail(email string, code string) error {
	type Temp struct {
		Title string `json:"title"`
		Logo  string `json:"logo"`
		Code  string `json:"code"`
	}

	return c.GetMail().RenderMail(
		"code.html",
		Temp{Title: c.GetAppName(), Logo: c.GetAppLogo(), Code: code},
		email,
		fmt.Sprintf("%s | OTP Verification", c.GetAppName()),
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

func (c *SystemConfig) GetAppName() string {
	title := strings.TrimSpace(c.General.Title)
	if len(title) == 0 {
		return "Chat Nio"
	}

	return title
}

func (c *SystemConfig) GetAppLogo() string {
	logo := strings.TrimSpace(c.General.Logo)
	if len(logo) == 0 {
		return "https://chatnio.net/favicon.ico"
	}

	return logo
}
