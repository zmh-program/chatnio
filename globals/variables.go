package globals

const ChatMaxThread = 5
const AnonymousMaxThread = 1

var AllowedOrigins = []string{
	"https://fystart.cn",
	"https://www.fystart.cn",
	"https://nio.fystart.cn",
	"https://chatnio.net",
	"https://www.chatnio.net",
	"https://nextweb.chatnio.net",
	"http://localhost:5173",
	"http://start.ovotun.ates.top/",
	"https://start.ovotun.ates.top/",
}

const (
	GPT3Turbo        = "gpt-3.5-turbo"
	GPT3Turbo0613    = "gpt-3.5-turbo-0613"
	GPT3Turbo0301    = "gpt-3.5-turbo-0301"
	GPT3Turbo16k     = "gpt-3.5-turbo-16k"
	GPT3Turbo16k0613 = "gpt-3.5-turbo-16k-0613"
	GPT3Turbo16k0301 = "gpt-3.5-turbo-16k-0301"
	GPT4             = "gpt-4"
	GPT40314         = "gpt-4-0314"
	GPT40613         = "gpt-4-0613"
	GPT432k          = "gpt-4-32k"
	GPT432k0314      = "gpt-4-32k-0314"
	GPT432k0613      = "gpt-4-32k-0613"
	Dalle            = "dalle"
	Claude2          = "claude-1" // claude v1.3
	Claude2100k      = "claude-2"
	ClaudeSlack      = "claude-slack"
	SparkDesk        = "spark-desk"
	ChatBison001     = "chat-bison-001"
	BingCreative     = "bing-creative"
	BingBalanced     = "bing-balanced"
	BingPrecise      = "bing-precise"
)

var GPT3TurboArray = []string{
	GPT3Turbo,
	GPT3Turbo0613,
	GPT3Turbo0301,
}

var GPT3Turbo16kArray = []string{
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
}

var GPT4Array = []string{
	GPT4,
	GPT40314,
	GPT40613,
}

var GPT432kArray = []string{
	GPT432k,
	GPT432k0314,
	GPT432k0613,
}

var ClaudeModelArray = []string{
	Claude2,
	Claude2100k,
}

var BingModelArray = []string{
	BingCreative,
	BingBalanced,
	BingPrecise,
}

var LongContextModelArray = []string{
	GPT3Turbo16k,
	GPT3Turbo16k0613,
	GPT3Turbo16k0301,
	GPT432k,
	GPT432k0314,
	GPT432k0613,
	Claude2,
	Claude2100k,
}

func in(value string, slice []string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

func IsGPT4Model(model string) bool {
	return in(model, GPT4Array) || in(model, GPT432kArray)
}

func IsGPT4NativeModel(model string) bool {
	return in(model, GPT4Array)
}

func IsGPT3TurboModel(model string) bool {
	return in(model, GPT3TurboArray) || in(model, GPT3Turbo16kArray)
}

func IsChatGPTModel(model string) bool {
	return IsGPT3TurboModel(model) || IsGPT4Model(model) || model == Dalle
}

func IsClaudeModel(model string) bool {
	return in(model, ClaudeModelArray)
}

func IsDalleModel(model string) bool {
	return model == Dalle
}

func IsSlackModel(model string) bool {
	return model == ClaudeSlack
}

func IsSparkDeskModel(model string) bool {
	return model == SparkDesk
}

func IsPalm2Model(model string) bool {
	return model == ChatBison001
}

func IsBingModel(model string) bool {
	return in(model, BingModelArray)
}

func IsLongContextModel(model string) bool {
	return in(model, LongContextModelArray)
}
