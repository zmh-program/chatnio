package channel

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type ApiInfo struct {
	Title        string `json:"title"`
	Logo         string `json:"logo"`
	File         string `json:"file"`
	Docs         string `json:"docs"`
	Announcement string `json:"announcement"`
	BuyLink      string `json:"buy_link"`
}

type generalState struct {
	Title   string `json:"title" mapstructure:"title"`
	Logo    string `json:"logo" mapstructure:"logo"`
	Backend string `json:"backend" mapstructure:"backend"`
	File    string `json:"file" mapstructure:"file"`
	Docs    string `json:"docs" mapstructure:"docs"`
}

type siteState struct {
	Quota        float64 `json:"quota" mapstructure:"quota"`
	BuyLink      string  `json:"buy_link" mapstructure:"buylink"`
	Announcement string  `json:"announcement" mapstructure:"announcement"`
}

type whiteList struct {
	Enabled   bool     `json:"enabled" mapstructure:"enabled"`
	Custom    string   `json:"custom" mapstructure:"custom"`
	WhiteList []string `json:"white_list" mapstructure:"whitelist"`
}

type mailState struct {
	Host      string    `json:"host" mapstructure:"host"`
	Port      int       `json:"port" mapstructure:"port"`
	Username  string    `json:"username" mapstructure:"username"`
	Password  string    `json:"password" mapstructure:"password"`
	From      string    `json:"from" mapstructure:"from"`
	WhiteList whiteList `json:"white_list" mapstructure:"whitelist"`
}

type searchState struct {
	Endpoint string `json:"endpoint" mapstructure:"endpoint"`
	Query    int    `json:"query" mapstructure:"query"`
}

type SystemConfig struct {
	General generalState `json:"general" mapstructure:"general"`
	Site    siteState    `json:"site" mapstructure:"site"`
	Mail    mailState    `json:"mail" mapstructure:"mail"`
	Search  searchState  `json:"search" mapstructure:"search"`
}

func NewSystemConfig() *SystemConfig {
	conf := &SystemConfig{}
	if err := viper.UnmarshalKey("system", conf); err != nil {
		panic(err)
	}

	conf.Load()
	return conf
}

func (c *SystemConfig) Load() {
	globals.NotifyUrl = c.GetBackend()
}

func (c *SystemConfig) SaveConfig() error {
	viper.Set("system", c)
	c.Load()

	return viper.WriteConfig()
}

func (c *SystemConfig) AsInfo() ApiInfo {
	return ApiInfo{
		Title:        c.General.Title,
		Logo:         c.General.Logo,
		File:         c.General.File,
		Docs:         c.General.Docs,
		Announcement: c.Site.Announcement,
		BuyLink:      c.Site.BuyLink,
	}
}

func (c *SystemConfig) UpdateConfig(data *SystemConfig) error {
	c.General = data.General
	c.Site = data.Site
	c.Mail = data.Mail
	c.Search = data.Search

	return c.SaveConfig()
}

func (c *SystemConfig) GetInitialQuota() float64 {
	return c.Site.Quota
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

func (c *SystemConfig) GetMailSuffix() []string {
	if c.Mail.WhiteList.Enabled {
		return c.Mail.WhiteList.WhiteList
	}

	return []string{}
}

func (c *SystemConfig) IsValidMailSuffix(suffix string) bool {
	if c.Mail.WhiteList.Enabled {
		return utils.Contains(suffix, c.Mail.WhiteList.WhiteList)
	}

	return true
}

func (c *SystemConfig) IsValidMail(email string) error {
	segment := strings.Split(email, "@")
	if len(segment) != 2 {
		return fmt.Errorf("invalid email format")
	}

	if suffix := segment[1]; !c.IsValidMailSuffix(suffix) {
		return fmt.Errorf("email suffix @%s is not allowed to register", suffix)
	}

	return nil
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
