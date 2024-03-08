package channel

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type ApiInfo struct {
	Title        string   `json:"title"`
	Logo         string   `json:"logo"`
	File         string   `json:"file"`
	Docs         string   `json:"docs"`
	Announcement string   `json:"announcement"`
	BuyLink      string   `json:"buy_link"`
	Contact      string   `json:"contact"`
	Footer       string   `json:"footer"`
	AuthFooter   bool     `json:"auth_footer"`
	Mail         bool     `json:"mail"`
	Article      []string `json:"article"`
	Generation   []string `json:"generation"`
	RelayPlan    bool     `json:"relay_plan"`
}

type generalState struct {
	Title   string `json:"title" mapstructure:"title"`
	Logo    string `json:"logo" mapstructure:"logo"`
	Backend string `json:"backend" mapstructure:"backend"`
	File    string `json:"file" mapstructure:"file"`
	Docs    string `json:"docs" mapstructure:"docs"`
}

type siteState struct {
	CloseRegister bool    `json:"close_register" mapstructure:"closeregister"`
	RelayPlan     bool    `json:"relay_plan" mapstructure:"relayplan"`
	Quota         float64 `json:"quota" mapstructure:"quota"`
	BuyLink       string  `json:"buy_link" mapstructure:"buylink"`
	Announcement  string  `json:"announcement" mapstructure:"announcement"`
	Contact       string  `json:"contact" mapstructure:"contact"`
	Footer        string  `json:"footer" mapstructure:"footer"`
	AuthFooter    bool    `json:"auth_footer" mapstructure:"authfooter"`
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

type commonState struct {
	Article    []string `json:"article" mapstructure:"article"`
	Generation []string `json:"generation" mapstructure:"generation"`
	Cache      []string `json:"cache" mapstructure:"cache"`
	Expire     int64    `json:"expire" mapstructure:"expire"`
	Size       int64    `json:"size" mapstructure:"size"`
}

type SystemConfig struct {
	General generalState `json:"general" mapstructure:"general"`
	Site    siteState    `json:"site" mapstructure:"site"`
	Mail    mailState    `json:"mail" mapstructure:"mail"`
	Search  searchState  `json:"search" mapstructure:"search"`
	Common  commonState  `json:"common" mapstructure:"common"`
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

	globals.ArticlePermissionGroup = c.Common.Article
	globals.GenerationPermissionGroup = c.Common.Generation
	globals.CacheAcceptedModels = c.Common.Cache

	globals.CacheAcceptedExpire = c.GetCacheAcceptedExpire()
	globals.CacheAcceptedSize = c.GetCacheAcceptedSize()
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
		Contact:      c.Site.Contact,
		Footer:       c.Site.Footer,
		AuthFooter:   c.Site.AuthFooter,
		BuyLink:      c.Site.BuyLink,
		Mail:         c.IsMailValid(),
		Article:      c.Common.Article,
		Generation:   c.Common.Generation,
		RelayPlan:    c.Site.RelayPlan,
	}
}

func (c *SystemConfig) UpdateConfig(data *SystemConfig) error {
	c.General = data.General
	c.Site = data.Site
	c.Mail = data.Mail
	c.Search = data.Search
	c.Common = data.Common

	utils.ApplySeo(c.General.Title, c.General.Logo)

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

func (c *SystemConfig) IsMailValid() bool {
	return c.GetMail().Valid()
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

	endpoint := c.Search.Endpoint
	if strings.HasSuffix(endpoint, "/") {
		return endpoint[:len(endpoint)-1]
	} else if !strings.HasSuffix(endpoint, "/search") {
		return endpoint[:len(endpoint)-7]
	}

	return endpoint
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

func (c *SystemConfig) GetCacheAcceptedModels() []string {
	return c.Common.Cache
}

func (c *SystemConfig) GetCacheAcceptedExpire() int64 {
	if c.Common.Expire <= 0 {
		// default 1 hour
		return 3600
	}

	return c.Common.Expire
}

func (c *SystemConfig) GetCacheAcceptedSize() int64 {
	if c.Common.Size < 1 {
		return 1
	}

	return c.Common.Size
}

func (c *SystemConfig) IsCloseRegister() bool {
	return c.Site.CloseRegister
}

func (c *SystemConfig) SupportRelayPlan() bool {
	return c.Site.RelayPlan
}
