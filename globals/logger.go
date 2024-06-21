package globals

import (
	"fmt"
	"strings"

	"github.com/natefinch/lumberjack"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

const DefaultLoggerFile = "chatnio.log"

var Logger *logrus.Logger

type AppLogger struct {
	*logrus.Logger
}

func (l *AppLogger) Format(entry *logrus.Entry) ([]byte, error) {
	data := fmt.Sprintf(
		"[%s] - [%s] - %s\n",
		strings.ToUpper(entry.Level.String()),
		entry.Time.Format("2006-01-02 15:04:05"),
		entry.Message,
	)

	if !viper.GetBool("log.ignore_console") {
		fmt.Print(data)
	}

	return []byte(data), nil
}

func init() {
	Logger = logrus.New()
	Logger.SetFormatter(&AppLogger{
		Logger: Logger,
	})

	Logger.SetOutput(&lumberjack.Logger{
		Filename:   fmt.Sprintf("logs/%s", DefaultLoggerFile),
		MaxSize:    1,
		MaxBackups: 500,
		MaxAge:     21, // 3 weeks
	})

	Logger.SetLevel(logrus.DebugLevel)
}

func Output(args ...interface{}) {
	Logger.Println(args...)
}

func Debug(args ...interface{}) {
	Logger.Debugln(args...)
}

func Info(args ...interface{}) {
	Logger.Infoln(args...)
}

func Warn(args ...interface{}) {
	Logger.Warnln(args...)
}

func Error(args ...interface{}) {
	Logger.Errorln(args...)
}

func Fatal(args ...interface{}) {
	Logger.Fatalln(args...)
}

func Panic(args ...interface{}) {
	Logger.Panicln(args...)
}
