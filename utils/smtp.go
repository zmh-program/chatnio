package utils

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"gopkg.in/gomail.v2"
	"strings"
	"text/template"
)

type SmtpPoster struct {
	Host     string
	Protocol bool
	Port     int
	Username string
	Password string
	From     string
}

func NewSmtpPoster(host string, protocol bool, port int, username string, password string, from string) *SmtpPoster {
	return &SmtpPoster{
		Host:     host,
		Protocol: protocol,
		Port:     port,
		Username: username,
		Password: password,
		From:     from,
	}
}

func (s *SmtpPoster) Valid() bool {
	return s.Host != "" && s.Port > 0 && s.Port <= 65535 && s.Username != "" && s.Password != "" && s.From != ""
}

func (s *SmtpPoster) SendMail(to string, subject string, body string) error {
	if !s.Valid() {
		return fmt.Errorf("smtp not configured properly")
	}

	// 创建 gomail 消息对象
	message := gomail.NewMessage()

	// 根据用户名是否包含"@"来决定发件人地址
	var from string
	if strings.Contains(s.Username, "@") {
		// 如果用户名包含"@", 则直接使用 From 作为发件人
		from = s.From
	} else {
		// 否则，将用户名和 From 组合成发件人的邮箱地址
		from = fmt.Sprintf("%s <%s>", s.Username, s.From)
	}
	message.SetHeader("From", from)
	message.SetHeader("To", to)
	message.SetHeader("Subject", subject)
	message.SetBody("text/html", body)

	// 创建 gomail 拨号器
	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)

	// 如果启用TLS协议
	if s.Protocol {
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,  // 禁用不安全的证书验证
			ServerName:         s.Host, // 设置ServerName为SMTP主机
		}
	} else {
		// 启用SSL时，不需要STARTTLS，直接进行加密连接
		dialer.SSL = true
	}

	// 针对Outlook的STARTTLS策略适配器
	if strings.Contains(s.Host, "outlook") {
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         s.Host,
		}
	}

	// 拨号并发送邮件
	if err := dialer.DialAndSend(message); err != nil {
		return fmt.Errorf("sent mail failed: %s", err.Error())
	}

	return nil
}

func (s *SmtpPoster) RenderTemplate(filename string, data interface{}) (string, error) {
	tmpl, err := template.New(filename).ParseFiles(fmt.Sprintf("utils/templates/%s", filename))
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.ExecuteTemplate(&buf, filename, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (s *SmtpPoster) RenderMail(filename string, data interface{}, to string, subject string) error {
	body, err := s.RenderTemplate(filename, data)
	if err != nil {
		return err
	}

	return s.SendMail(to, subject, body)
}
