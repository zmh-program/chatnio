<div align="center">

# [Chat Nio](https://nio.fystart.cn)

👋 轻量级 ChatGPT 聊天平台

👋 Lightweight ChatGPT Chat Platform

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

mysql:
  host: "localhost"
  port: 3306
  user: root
  password: ...

  db: "chatnio"

secret: ...
auth:
  access: ...
  salt: ...
```

## 📄 开源协议 | License
Apache License 2.0
