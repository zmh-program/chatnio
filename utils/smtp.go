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

	// Create gomail message object
	message := gomail.NewMessage()

	// Determine sender address based on whether the username contains "@"
	var from string
	if strings.Contains(s.Username, "@") {
		// If the username contains "@", use From as the sender
		from = s.From
	} else {
		// Otherwise, combine the username and From to form the sender's email address
		from = fmt.Sprintf("%s <%s>", s.Username, s.From)
	}
	message.SetHeader("From", from)
	message.SetHeader("To", to)
	message.SetHeader("Subject", subject)
	message.SetBody("text/html", body)

	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)

	// If TLS protocol is enabled
	if s.Protocol {
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,  // Disable insecure certificate verification
			ServerName:         s.Host, // Set ServerName to the SMTP host
		}
	} else {
		// When SSL is enabled, no need for STARTTLS, directly establish an encrypted connection
		dialer.SSL = true
	}

	// Specific handling for different providers
	switch {
	case strings.Contains(s.Host, "outlook"):
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         s.Host,
		}
	case strings.Contains(s.Host, "qq"):
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         s.Host,
		}
	case strings.Contains(s.Host, "office365"):
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         s.Host,
		}
	case strings.Contains(s.Host, "resend"):
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         s.Host,
		}
	case strings.Contains(s.Host, "tencent"):
		dialer.TLSConfig = &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         s.Host,
		}
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
