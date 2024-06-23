package utils

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"

	"gopkg.in/mail.v2"
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

	var dialer *mail.Dialer
	var from string

	if strings.Contains(s.Username, "@") {
		dialer = mail.NewDialer(s.Host, s.Port, s.Username, s.Password)
		from = s.From
	} else {
		dialer = mail.NewDialer(s.Host, s.Port, s.From, s.Password)
		from = fmt.Sprintf("%s <%s>", s.Username, s.From)
	}

	message := mail.NewMessage()
	message.SetHeader("From", from)
	message.SetHeader("To", to)
	message.SetHeader("Subject", subject)
	message.SetBody("text/html", body)

	if s.Protocol {
		dialer.StartTLSPolicy = mail.MandatoryStartTLS
	} else {
		dialer.StartTLSPolicy = mail.NoStartTLS
	}

	// outlook STARTTLS policy adapter
	if strings.Contains(s.Host, "outlook") {
		dialer.StartTLSPolicy = mail.MandatoryStartTLS
	}

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
