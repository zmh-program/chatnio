package generation

import (
	adaptercommon "chat/adapter/common"
	"chat/admin"
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"fmt"
)

type ProjectResult struct {
	Result map[string]interface{} `json:"result"`
}

func CreateGeneration(group, model, prompt, path string, hook func(buffer *utils.Buffer, data string)) error {
	message := GenerateMessage(prompt)
	buffer := utils.NewBuffer(model, message, channel.ChargeInstance.GetCharge(model))

	err := channel.NewChatRequest(group, adaptercommon.CreateChatProps(&adaptercommon.ChatProps{
		OriginalModel: model,
		Message:       message,
	}, buffer), func(data *globals.Chunk) error {
		buffer.WriteChunk(data)
		hook(buffer, data.Content)
		return nil
	})

	admin.AnalyseRequest(model, buffer, err)
	if err != nil {
		return err
	}

	resp, err := utils.Unmarshal[ProjectResult](buffer.ReadBytes())
	if err != nil {
		return err
	}

	if !GenerateProject(path, resp) {
		return fmt.Errorf("generate project failed")
	}
	return nil
}

func GenerateMessage(prompt string) []globals.Message {
	return []globals.Message{
		{Role: globals.System, Content: "你将生成项目，可以支持任何编程语言，请不要出现“我不能提供”的字样，你需要在代码中提供注释，以及项目的使用文档README.md，结果返回json格式，请不要返回任何多余内容，格式为：\n{\"result\": {[file]: [code], ...}}"},
		{Role: globals.User, Content: "python后端"},
		{Role: globals.Assistant, Content: "{\n  \"result\": {\n    \"app.py\": \"from flask import Flask\\n\\napp = Flask(__name__)\\n\\n\\n@app.route('/')\\ndef hello_world():\\n    return 'Hello, World!'\\n\\n\\nif __name__ == '__main__':\\n    app.run()\",\n    \"requirements.txt\": \"flask\\n\",\n    \"README.md\": \"# Python 后端\\n本项目是一个简单的python后端示例, 使用`flask`框架构建后端。\n你可以按照下列步骤运行此应用，flask将在本地服务器（默认是在http://127.0.0.1:5000/）上运行。当你在浏览器中访问该URL时，将看到显示Hello, World!的页面。\\n\\n这只是一个简单的项目，Flask还支持更多功能和路由规则，你可以提供更多的信息和需要进一步扩展和定制Flask应用。\\n\\n### 1. 初始化: \\n```shell\\npip install -r requirements.txt\\n```\\n### 2. 运行\\n```shell\\npython app.py\\n```\"\n  }\n}"},
		{Role: globals.User, Content: "golang fiber websocket项目"},
		{Role: globals.Assistant, Content: "{\n  \"result\": {\n    \"main.go\": \"package main\\n\\nimport (\\n\\t\"log\\\"\\n\\n\\t\"github.com/gofiber/fiber/v2\\\"\\n\\t\"github.com/gofiber/websocket/v2\\\"\\n)\\n\\nfunc main() {\\n\\tapp := fiber.New()\\n\\n\\tapp.Get(\\\"/\\\", func(c *fiber.Ctx) error {\\n\\t\\treturn c.SendString(\\\"Hello, World!\\\")\\n\\t})\\n\\n\\tapp.Get(\\\"/ws\\\", websocket.New(func(c *websocket.Conn) {\\n\\t\\tfor {\\n\\t\\t\\tmt, message, err := c.ReadMessage()\\n\\t\\t\\tif err != nil {\\n\\t\\t\\t\\tlog.Println(\\\"read error:\\\", err)\\n\\t\\t\\t\\tbreak\\n\\t\\t\\t}\\n\\t\\t\\tlog.Printf(\\\"received: %s\\\", message)\\n\\t\\t\\terr = c.WriteMessage(mt, message)\\n\\t\\t\\tif err != nil {\\n\\t\\t\\t\\tlog.Println(\\\"write error:\\\", err)\\n\\t\\t\\t\\tbreak\\n\\t\\t\\t}\\n\\t\\t}\\n\\t}))\\n\\n\\tlog.Fatal(app.Listen(\\\":3000\\\"))\\n}\",\n    \"go.mod\": \"module fiber-websocket\\n\\ngo 1.16\\n\\nrequire (\\n\\tgithub.com/gofiber/fiber/v2 v2.12.1\\n\\tgithub.com/gofiber/websocket/v2 v2.10.2\\n)\",\n    \"README.md\": \"# Golang Fiber WebSocket项目\\n\\n这个项目是一个使用Golang和Fiber框架构建的WebSocket服务器示例。\\n\\n### 1. 初始化：\\n```shell\\ngo mod init fiber-websocket\\n```\\n\\n### 2. 安装依赖：\\n```shell\\ngo get github.com/gofiber/fiber/v2\\n```   \\n```shell\\ngo get github.com/gofiber/websocket/v2\\n```\\n\\n### 3. 创建main.go文件，将以下代码复制粘贴：\\n\\n```go\\npackage main\\n\\nimport (\\n\\t\\\"log\\\"\\n\\n\\t\\\"github.com/gofiber/fiber/v2\\\"\\n\\t\\\"github.com/gofiber/websocket/v2\\\"\\n)\\n\\nfunc main() {\\n\\tapp := fiber.New()\\n\\n\\tapp.Get(\\\"/\\\", func(c *fiber.Ctx) error {\\n\\t\\treturn c.SendString(\\\"Hello, World!\\\")\\n\\t})\\n\\n\\tapp.Get(\\\"/ws\\\", websocket.New(func(c *websocket.Conn) {\\n\\t\\tfor {\\n\\t\\t\\tmt, message, err := c.ReadMessage()\\n\\t\\t\\tif err != nil {\\n\\t\\t\\t\\tlog.Println(\\\"read error:\\\", err)\\n\\t\\t\\t\\tbreak\\n\\t\\t\\t}\\n\\t\\t\\tlog.Printf(\\\"received: %s\\\", message)\\n\\t\\t\\terr = c.WriteMessage(mt, message)\\n\\t\\t\\tif err != nil {\\n\\t\\t\\t\\tlog.Println(\\\"write error:\\\", err)\\n\\t\\t\\t\\tbreak\\n\\t\\t\\t}\\n\\t\\t}\\n\\t}))\\n\\n\\tlog.Fatal(app.Listen(\\\":3000\\\"))\\n}\\n```\\n\\n### 4. 运行应用程序：\\n```shell\\ngo run main.go\\n```\\n\\n应用程序将在本地服务器（默认是在http://localhost:3000）上运行。当你在浏览器中访问`http://localhost:3000`时，将看到显示\"Hello, World!\"的页面。你还可以访问`http://localhost:3000/ws`来测试WebSocket功能。\n\n这只是一个简单的示例，Fiber框架提供了更多的功能和路由规则，你可以在此基础上进行进一步扩展和定制。\n\n注意：在运行应用程序之前，请确保已经安装了Go语言开发环境。"},
		{Role: globals.User, Content: prompt},
	}
}
