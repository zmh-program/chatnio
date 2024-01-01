<div align="center">

![chatnio](/app/public/logo.png)

# [Chat Nio](https://chatnio.net)

🚀 强大精美的 **AI聚合** 聊天平台

🚀 Powerful and beautiful **AI Aggregation** chat platform


[官网](https://chatnio.net) | [开放文档](https://docs.chatnio.net) | [SDKs](https://docs.chatnio.net/kuai-su-kai-shi) | [QQ 群](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=1mv1Y8SyxnQVvQCoqhmIgVTbwQmkNmvQ&authKey=5KUA9nJPR29nQwjbsYNknN2Fj6cKePkRes%2B1QZy84Dr4GHYVzcvb0yklxiMMNVJN&noverify=0&group_code=749482576)

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
17. ⚙ 后台管理系统 (仪表盘，用户管理，公告管理等)
    - ⚙ Admin system (dashboard, user management, announcement management, etc.)
18. ⚒ 渠道管理 (多账号均衡负载，优先级调配，权重负载，模型映射，渠道状态管理)
    - ⚒ Channel management (multi-account load balancing, priority allocation, weight load, model mapping, channel status management)
19. ⚡ 计费系统 (支持匿名计费，按次数计费，Token 弹性计费等方式)
    - ⚡ Billing system (support anonymous billing, billing by number of times, Token billing, etc.)
20. 📂 文件上传功能 (支持 pdf, docx, pptx, xlsx, 音频, 图片等)
    - 📂 File upload function (support pdf, docx, pptx, xlsx, audio, images, etc.)
21. 🥪 All in one (支持 smtp 发件，用户管理等功能)
    - 🥪 All in one (supports smtp sending, user management, etc.)


## 🔨 模型 | Models
- [x] OpenAI ChatGPT (GPT-3.5, GPT-4, Instruct, DALL-E 2, DALL-E 3, Text-Davincci, ...)
- [x] Azure OpenAI
- [x] Anthropic Claude (claude-2, claude-instant)
- [x] Slack Claude (deprecated)
- [x] Sparkdesk (v1.5, v2, v3)
- [x] Google Gemini (PaLM2)
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
![channel](/screenshot/channel.png)
![charge](/screenshot/charge.png)


## 📦 部署 | Deploy
*部署成功后，管理员账号为 `root`，密码默认为 `chatnio123456`*

1. ⚡ Docker Compose 安装 (推荐)
    
    > 运行成功后，宿主机映射地址为 `http://localhost:8000`，使用 Nginx / Apache 进行反代是一个不错的选择（以及 SSL 配置）
    ```shell
    git clone https://github.com/Deeptrain-Community/chatnio.git
    cd chatnio # project directory
    docker-compose up -d # start service in background
    ```
   
   chatnio 版本更新：
   ```shell
   docker-compose down
   docker-compose pull  # pull latest image
   docker-compose up -d # start service in background
   ```
   
   > - MySQL 数据库挂载目录项目 ~/**db**
   > - Redis 数据库挂载目录项目 ~/**redis**
   > - 配置文件挂载目录项目 ~/**config**

2. ⚡ Docker 安装 (轻量运行时, 常用于外置 _MYSQL/RDS_ 服务)
    ```shell
   docker run -d --name chatnio \
      -p 8000:8094 \
      -v ~/config:/app/config \
      -e MYSQL_HOST=<your-mysql-host> \
      -e MYSQL_PORT=3306 \
      -e MYSQL_DATABASE=chatnio \
      -e MYSQL_USER=<username> \
      -e MYSQL_PASSWORD=<password> \
      -e REDIS_HOST=<your-redis-host> \
      -e REDIS_PORT=6379 \
      -e SECRET=<your-jwt-secret> \
      -e SERVE_STATIC=true \
      programzmh/chatnio:latest
    ```
   > - *-p 8000:8094* 指映射宿主机端口为 8000，可自行修改
   > - MYSQL_HOST: MySQL 数据库地址
   > - MYSQL_PORT: MySQL 数据库端口
   > - MYSQL_DATABASE: MySQL 数据库名称
   > - MYSQL_USER: MySQL 数据库用户名
   > - MYSQL_PASSWORD: MySQL 数据库密码
   > - REDIS_HOST: Redis 数据库地址
   > - REDIS_PORT: Redis 数据库端口
   > - SECRET: JWT 密钥，自行生成修改即可
   > - SERVE_STATIC: 是否启用静态文件服务 （仅在前后端分离部署时，如 https://chatnio.net 后端部署为 https://api.chatnio.net 的情况才需关闭静态文件服务，默认情况下api地址为 **/api**，如需修改，请自行修改)
   > - *-v ~/config:/app/config* 指映射宿主机配置文件目录为 ~/config，可自行修改

3. ⚒ 编译安装 (自定义性强)
    ```shell
    git clone https://github.com/Deeptrain-Community/chatnio.git
    cd chatnio # project directory
    go build -o chatnio # build backend
    nohup ./chatnio > output.log & # run backend
    
    cd app # frontend directory (~/app)
    npm install -g pnpm # install pnpm
    pnpm install # install frontend dependencies
    pnpm build # build frontend
    
    # run frontend
    # a common way is to use nginx/apache to serve the static files
    ```

## 🔨 配置 | Config
> 仅在编译安装时需要修改配置文件
> Docker 安装可修改环境变量，如 mysql.host 设置 `MYSQL_HOST` 环境即可
~/config/**config.yaml**
```yaml
mysql:
  db: chatnio
  host: localhost
  password: chatnio123456
  port: 3306
  user: root

redis:
  host: localhost
  port: 6379

secret: SbitdyN5ZH39cNxSrG3kMNZ1GfiyyQ43 # jwt secret

auth:
  use_deeptrain: false

server:
  port: 8094
system:
  general:
    backend: ""
  mail:
    host: ""
    port: 465
    username: ""
    password: ""
    from: ""
  search:
    endpoint: https://duckduckgo-api.vercel.app
    query: 5

serve_static: false # serve static files (false if only using backend)
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


## 🎃 贡献者 | Contributors
![Contributors](https://stats.deeptrain.net/contributor/Deeptrain-Community/chatnio/?column=6&theme=light)

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

## 写在最后
Chat Nio 方向更多是提供一站式服务：
- 不会考虑前端自定义 Endpoint （考虑到 token 的安全性），不会考虑脱离后端纯前端运行来支持 Vercel / Netify 一键部署，如追求轻量化部署请前往 [Next Web](https://github.com/Yidadaa/ChatGPT-Next-Web) / [Chat Box](https://github.com/Bin-Huang/chatbox) 等优秀的开源项目， Chat Nio 相较于轻量化的优势在于更便捷的跨设备同步，仅需登录账户就可同步设置 / 对话等功能，以及平台内置的功能。然而仍然可以通过 Key 中转来使用此类项目。
- 不会考虑支持 Midjourney Proxy 中转回调等其他一众格式的中转，如仅需搭建中转服务请右转 [One API](https://github.com/songquanpeng/one-api) 等项目即使在其项目架构和代码并非 *"最佳方案"* 的情况下，我仍然推荐你使用其服务进行中转，毕竟活跃的开发者们和社区，以及项目的方向性和针对性，经过时间考验是值得推荐的成熟的方案。 Chat Nio 的中转偏向 **Chat**，带来的好处是你可以无需自行兼容代码在 nextweb 等项目中直接使用该格式，如 GPT 4 Vision Preview（仅需在消息中复制 URL 即可），DALL-E，Midjourney 类等模型可直接使用聊天接口，依托于 Chat Nio 的 Adapter 层设计，可进行方便使用而无需自行兼容格式。
- 还有一点需要注意的是，正如上文所说，我后期在时间不宽裕的情况下不会去考虑支持非导向为 Chat 的 Fine Tuning / Embeddings 等微调类模型，请右转。在 issue 里被我忽略或者关闭请不要不满。作为中学生（无他意，我不喜欢打年龄牌），我的时间有限，如果我不认为你的建议是值得去实现的，我不会去浪费时间。同时，不看文档提问题，不看相同 issue 提问题永远不是值得推荐的，同样适用于社区群中。
- 顺带一提，不要以一个非友好状态来提问，学会良好的提问是推荐的。我不推荐你认为你自己是高人一等的。
