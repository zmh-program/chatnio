<div align="center">

![chatnio](/app/public/logo.png)

# [Chat Nio](https://chatnio.net)

🚀 强大精美的 **AI聚合** 聊天平台

🚀 Powerful and beautiful **AI Aggregation** chat platform


[官网](https://chatnio.net) | [开放文档](https://docs.chatnio.net) | [SDKs](https://docs.chatnio.net/kuai-su-kai-shi) | [QQ 群](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=YKcvGGlM03LYWlPk-iosqAqL4qHwOtBx&authKey=6cjCqRNKNuOUJltyo%2FNgmKm%2BS%2FUCtAyVHCnirHyxNuxGExUHsJRtlSaW1EeDxhNx&noverify=0&group_code=565902327)

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
9. 👋 对话分享
    - 👋 Conversation sharing
10. 🎁 图片生成功能
     - 🎁 Image generation
11. 🔔 PWA 应用
    - 🔔 PWA application
12. ⚡ Token 计费系统
    - ⚡ Token billing system
13. 📚 逆向工程模型支持
    - 📚 Reverse engineering model support
14. 🌏 国际化支持
    - 🌏 Internationalization support
      - 🇨🇳 简体中文
      - 🇺🇸 English
      - 🇷🇺 Русский
15. 🍎 主题切换
    - 🍎 Theme switching
16. 🥪 Key 中转服务
    - 🥪 Key relay service
17. 🔨 多模型支持
    - 🔨 Multi-model support
18. ⚙ 后台管理系统
    - ⚙ Admin system
19. 📂 文件上传功能 (支持 pdf, docx, pptx, xlsx, 音频, 图片等)
    - 📂 File upload function (support pdf, docx, pptx, xlsx, audio, images, etc.)



## 🔨 模型 | Models
- [x] OpenAI ChatGPT (GPT-3.5, GPT-4, Instruct, DALL-E 2, DALL-E 3, Text-Davincci, ...)
- [x] Azure OpenAI
- [x] Anthropic Claude (claude-2, claude-instant)
- [x] Slack Claude (deprecated)
- [x] Sparkdesk (v1.5, v2, v3)
- [x] Google PaLM2
- [x] New Bing (creative, balanced, precise)
- [x] ChatGLM (turbo, pro, std, lite)
- [x] DashScope Tongyi (plus, turbo)
- [x] Midjourney (relax, fast, turbo)
- [x] Stable Diffusion XL
- [x] Tencent Hunyuan
- [x] Baichuan AI
- [x] Douyin Skylark (lite, plus, pro, chat)
- [x] 360 GPT
- [x] LLaMa 2 (70b, 13b, 7b) 
- [x] Code LLaMa (34b, 13b, 7b)
- [ ] RWKV

## 📚 预览 | Screenshots
![landspace](/screenshot/landspace.png)
![feature](/screenshot/code.png)
![latex](/screenshot/latex.jpg)
![generation](/screenshot/generation.png)
![shop](/screenshot/shop.png)
![subscription](/screenshot/subscription.png)
![admin](/screenshot/admin.png)


## 📦 部署 | Deploy
**当前安装需要额外安装 Deeptrain 统一账户管理，all in one功能正在开发中**
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

mysql:
  host: "localhost"
  port: 3306
  user: root
  password: ...

  db: "chatnio"

secret: ... # jwt secret
auth:
  access: ...
  salt: ...
  sign: ...

openai:
  gpt3:
    endpoint: https://api.openai.com
    apikey: sk-...|sk-...

  gpt4:
    endpoint: https://api.openai.com
    apikey: sk-...|sk-...

slack:
  bot_id: ...
  token: ...
  channel: ...

claude:
  apikey: ...
  endpoint: ...

sparkdesk:
  app_id: ...
  api_secret: ...
  api_key: ...
  model: generalv2
  endpoint: wss://spark-api.xf-yun.com/v2.1/chat

palm2:
  endpoint: ...
  apikey: ...

bing:
  # learn more at https://github.com/Deeptrain-Community/chatnio-bing-service
  endpoint: ...
  secret: ...

zhipuai:
  endpoint: https://open.bigmodel.cn
  apikey: ...

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

## ❤ 捐助 | Sponsor
[@4EvEr](https://github.com/3081394176) ￥1000
