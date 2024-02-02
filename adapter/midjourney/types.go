package midjourney

const (
	SuccessCode  = 1
	ExistedCode  = 21
	QueueCode    = 22
	MaxQueueCode = 23
	NudeCode     = 24
)

const (
	NotStartStatus = "NOT_START"
	Submitted      = "SUBMITTED"
	InProgress     = "IN_PROGRESS"
	Failure        = "FAILURE"
	Success        = "SUCCESS"
)

const (
	TurboMode = "--turbo"
	FastMode  = "--fast"
	RelaxMode = "--relax"
)

var RendererMode = []string{TurboMode, FastMode, RelaxMode}

type CommonHeader struct {
	ContentType string `json:"Content-Type"`
	MjApiSecret string `json:"mj-api-secret,omitempty"`
}

type CommonResponse struct {
	Code        int    `json:"code"`
	Description string `json:"description"`
	Result      string `json:"result"`
}

type ImagineRequest struct {
	NotifyHook string `json:"notifyHook"`
	Prompt     string `json:"prompt"`
}

type ChangeRequest struct {
	NotifyHook string `json:"notifyHook"`
	Action     string `json:"action"`
	Index      *int   `json:"index,omitempty"`
	TaskId     string `json:"taskId"`
}

type NotifyForm struct {
	Id          string      `json:"id"`
	Action      string      `json:"action"`
	Status      string      `json:"status"`
	Prompt      string      `json:"prompt"`
	PromptEn    string      `json:"promptEn"`
	Description string      `json:"description"`
	SubmitTime  int64       `json:"submitTime"`
	StartTime   int64       `json:"startTime"`
	FinishTime  int64       `json:"finishTime"`
	Progress    string      `json:"progress"`
	ImageUrl    string      `json:"imageUrl"`
	FailReason  interface{} `json:"failReason"`
}

type StorageForm struct {
	Task       string `json:"task"`
	Action     string `json:"action"`
	Url        string `json:"url"`
	FailReason string `json:"failReason"`
	Progress   string `json:"progress"`
	Status     string `json:"status"`
}
