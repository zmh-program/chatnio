<div align="center">

![chatnio](/app/public/logo.png)

# [Chat Nio](https://chatnio.net)

👋 轻量级 ChatGPT 聊天平台

👋 Lightweight ChatGPT Chat Platform

[官网](https://chatnio.net) | [开放文档](https://docs.chatnio.net) | [SDKs](https://docs.chatnio.net/kuai-su-kai-shi) | [QQ 群]()

[![code-stats](https://stats.deeptrain.net/repo/Deeptrain-Community/chatnio)](https://stats.deeptrain.net)

</div>

## 📝 功能 | Features
1. ✨ **AI 联网功能**
    - ✨ **AI online searching service**
2. ⚡ 多账户均衡负载
   - ⚡ Multi-account load balancing
3. 🎉 HTTP2 Stream 实时响应功能
   - 🎉 HTTP2 Stream real-time response function
4. 🚀 节流和鉴权体系
    - 🚀 Throttling and authentication system
5. 🌈 丰富的聊天功能 (代码高亮，latex支持，卡片生成，右键菜单)
    - 🌈 Rich chat features (code highlight, latex support, card generation, right-click menu)
6. 🎨 多端适配
    - 🎨 Multi-device adaptation
7. 📦 缓存系统
    - 📦 Cache system
8. 🎈 对话记忆功能
    - 🎈 Conversation memorization
9. 🎁 图片生成功能
    - 🎁 Image generation
10. 🔔 PWA 应用
    - 🔔 PWA application
11. ⚡ Token 计费系统
    - ⚡ Token billing system
12. 📚 逆向工程模型支持
    - 📚 Reverse engineering model support
13. 🌏 国际化支持
    - 🌏 Internationalization support
      - 🇨🇳 简体中文
      - 🇺🇸 English
      - 🇷🇺 Русский
14. 🍎 主题切换
    - 🍎 Theme switching
15. 🥪 Key 中转服务
    - 🥪 Key relay service
16. 🔨 多模型支持
    - 🔨 Multi-model support



## 🔨 模型 | Models
- ChatGPT
    - GPT-3.5-Turbo (_0613_, _0301_)
    - GPT-3.5-Turbo-16k (_0613_, _0301_)
    - GPT-3.5-Reverse (_text-davincci-002-render-sha_, _text-davincci-002-render-paid_)
    - GPT-4 (_0314_, _0613_)
    - GPT-4-32k (_0314_, _0613_)
    - GPT-4-Reverse (_gpt-4_)
    - DALL-E
- Claude
    - Slack-Claude (unstable)
    - Claude-2
    - Claude-2-100k
- SparkDesk 讯飞星火
    - v1.5
    - v2.0
- Google PaLM2
    - Chat
    - Text
    - Fine-tune
    - Embedding
- New Bing (unstable)
  - Creative
  - Balanced
  - Precise

- More models are under development...

## 📚 预览 | Screenshots
![landspace](/screenshot/landspace.png)
![feature](/screenshot/code.png)
![latex](/screenshot/latex.jpg)
![shop](/screenshot/shop.png)
![subscription](/screenshot/subscription.png)

## 扩展 | Extension
![card](https://i.chatnio.net/?message=hi)
```markdown
![card](https://i.chatnio.net/?message=hi)
```

![card](https://i.chatnio.net/?message=itab起始页介绍&theme=dark)
```markdown
![card](https://i.chatnio.net/?message=itab起始页介绍&theme=dark)
```

- `message`: 内容
- `theme`: 主题
   - `dark`: 暗色
   - `light`: 亮色 (默认)
- `web` 是否开启联网版功能 (默认开启)



## 📦 部署 | Deploy
```shell
git clone https://github.com/Deeptrain-Community/chatnio.git
cd chatnio

go build -o chatnio
cd app
npm install
npm run build
```

## 🔨 配置 | Config
```yaml
debug: true
server:
  port: 8094

redis:
  host: localhost
  port: 6379

openai:
  anonymous: sk-xxxxxx|sk-xxxxxx|sk-xxxxxx
  anonymous_endpoint: https://api.openai.com/v1
  
  user: sk-xxxxxx|sk-xxxxxx|sk-xxxxxx
  user_endpoint: https://api.openai.com/v1
  
  image: sk-xxxxxx|sk-xxxxxx|sk-xxxxxx
  image_endpoint: https://api.openai.com/v1
  
  gpt4: sk-xxxxxx|sk-xxxxxx|sk-xxxxxx
  gpt4_endpoint: https://api.openai.com/v1

  reverse: gpt-4  # cf reverse
  pro: ey...|ey...|ey...
  pro_endpoint: .../imitate/v1


mysql:
  host: localhost
  port: 3306
  user: root
  password: ...

  db: chatnio

secret: ...
auth:
  access: ...
  salt: ...
  sign: ...
```

## 📚 开发文档 | Docs
[开发文档](https://docs.chatnio.net)

## ⚡ Key 中转服务 | Key Relay Service
- 支持多模型兼容层，这意味着你可以使用一次代码，同时兼容多家 AI 模型
  - Support multi-model compatible layer, which means you can use one code to be compatible with multiple AI models at the same time 
- 支持多账户均衡负载，高并发
    - Support multi-account load balancing, high concurrency

将 `https://api.openai.com` 替换为 `https://api.chatnio.net`，填入控制台中的 `API 设置` 中的 API Key 即可使用

Replace `https://api.openai.com` with `https://api.chatnio.net` and fill in the API Key in the `API Settings` in the console to use

## 📦 技术栈 | Tech Stack
- 前端: React + Radix UI + Tailwind CSS + Redux
- 后端: Golang + Gin + Redis + MySQL + Tiktoken (OpenAI)
- 应用技术: PWA + HTTP2 + WebSocket + Stream Buffer


## 🎈 感谢 | Thanks
感谢这些开源项目提供的思路：
- ChatGPT 逆向工程: [go-chatgpt-api](https://github.com/linweiyuan/go-chatgpt-api)
- New Bing 逆向工程: [EdgeGPT](https://github.com/acheong08/EdgeGPT)

## 🎃 开发团队 | Team
- [@ProgramZmh](https://github.com/zmh-program) （全栈开发）
- [@Sh1n3zz](https://github.com/sh1n3zz) （全栈开发）
- [@一個小果冻](https://b23.tv/XjdZ4DN) （美工、UI 设计）


## 📚 SDKs
- [JavaScript SDK](https://github.com/Deeptrain-Community/chatnio-api-node)
- [Python SDK](https://github.com/Deeptrain-Community/chatnio-api-python)
- [Golang SDK](https://github.com/Deeptrain-Community/chatnio-api-go)

## ✨ 其他项目 | Other Projects

- [Fyrrum Start](https://fystart.com)
- [ChatNio Next Web](https://nextweb.chatnio.net)

## 📄 开源协议 | License
Apache License 2.0

## ❤ 捐助 | Donate
[@LightXi](https://github.com/LightXi)
