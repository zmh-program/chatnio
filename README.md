<div align="center">

![chatnio](/app/public/logo.png)

# [Chat Nio](https://nio.fystart.cn)

👋 轻量级 ChatGPT 聊天平台

👋 Lightweight ChatGPT Chat Platform

[![code-stats](https://stats.deeptrain.net/repo/zmh-program/chatnio)](https://stats.deeptrain.net)

</div>

## 📝 功能 | Features
1. ✨ **ChatGPT 联网功能**
    - ✨ **ChatGPT online searching service**
2. ⚡ 多账户均衡负载
   - ⚡ Multi-account load balancing
3. 🎉 HTTP2 Stream 实时响应功能
   - 🎉 HTTP2 Stream real-time response function
4. 🚀 节流和鉴权体系
    - 🚀 Throttling and authentication system
5. 🌈 丰富的聊天功能
    - 🌈 Rich chat features
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
11. ⚡ GPT-4 Token 计费系统
    - ⚡ GPT-4 Token billing system

## 📚 预览 | Screenshots
![landspace](/screenshot/landspace.png)
![feature](/screenshot/code.png)
![shop](/screenshot/shop.png)

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
git clone https://github.com/zmh-program/chatnio.git
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

## 📦 技术栈 | Tech Stack
- 前端: React + Radix UI + Tailwind CSS + Redux
- 后端: Golang + Gin + Redis + MySQL + Tiktoken (OpenAI)
- 应用技术: PWA + HTTP2 + WebSocket + Stream Buffer


## 📄 开源协议 | License
Apache License 2.0
