package utils

import (
	"bytes"
	"fmt"
	"gopkg.in/mail.v2"
	"strings"
	"text/template"
)

type SmtpPoster struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

func NewSmtpPoster(host string, port int, username string, password string, from string) *SmtpPoster {
	return &SmtpPoster{
		Host:     host,
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

	dialer := mail.NewDialer(s.Host, s.Port, s.From, s.Password)
	message := mail.NewMessage()

	message.SetHeader("From", fmt.Sprintf("%s <%s>", s.Username, s.From))
	message.SetHeader("To", to)
	message.SetHeader("Subject", subject)
	message.SetBody("text/html", body)

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
