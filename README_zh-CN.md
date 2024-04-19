<div align="center">

![chatboom](/app/src/svg/logo.svg)

# [Chat Boom](https://chatboom.net)

_🚀 **下一代 AI 一站式解决方案**_

_🚀 **Next Generation AI One-Stop Solution**_

本项目基于chatnio二次开发，原项目链接[Chat Nio](https://github.com/Deeptrain-Community/chatnio.git)

</div>

## 📝 功能

- ✨ **AI 聊天对话功能**
  1. **丰富格式兼容**
     - 支持 Vision 模型, 同时支持 ***直接上传图片*** 和 ***输入图片直链或 Base64 图片*** 功能 (如 GPT-4 Vision Preview, Gemini Pro Vision 等模型)
     - 支持 DALL-E 模型绘图
     - 支持 Midjourney / Niji 模型的 **Imagine** / **Upscale** / **Variant** / **Reroll** 操作
     ![Midjourney 绘图](/screenshot/code.png)
  2. **丰富 Markdown 支持和主题切换**, 支持明暗模式, 代码高亮, Mermaid, LaTeX 公式, 表格, 进度条, Virtual Message 等
     ![Markdown 消息](/screenshot/latex.jpg)
     ![Markdown Mermaid](/screenshot/mermaid.png)
  3. **支持消息菜单**, 支持重新回答, 复制消息, 使用消息, 编辑消息, 删除消息, 保存为文件等操作
     ![Vision 支持](/screenshot/vision.png)
  4. **支持多端适配**, 支持 PWA 应用, 支持桌面端 *(桌面端基于 [Tauri](https://github.com/tauri-apps/tauri))*
  5. **对话记忆功能**, 云端同步, 原生支持站点直链分享对话, 支持使用分享对话, 分享对话保存为图片, 支持分享管理 (支持查看, 删除分享等操作)
     ![对话分享](/screenshot/sharing.png)
  6. **原生支持全模型文件解析**, 支持 pdf, docx, pptx, xlsx, 图片等格式解析
     ![文件上传](/screenshot/file.png)
  7. 支持全模型 DuckDuckGo 联网搜索功能 _(详情参考项目 [duckduckgo-api](https://github.com/binjie09/duckduckgo-api), 需自行搭建并在系统设置中联网设置中设置, 感谢作者 [@binjie09](https://github.com/binjie09), 中转 API 模型前加 **web-** 前缀即可开启联网搜索)_
     ![联网搜索](/screenshot/online.png)
  8. **大文本全屏编辑支持**, 支持 *纯文本编辑*, *编辑预览模式*, *纯预览模式* 三种模式切换
     ![编辑器](/screenshot/editor.png)
  9. **模型市场功能**, 支持模型搜索, 支持顺序拖拽, 包含模型名称, 模型描述, 模型 Tags, 模型头像, 自动绑定模型的价格设置, 自动绑定订阅配额 (包含在订阅的模型将标有 *plus* 标签)
     ![模型市场](/screenshot/market.png)
  10. **支持预设功能**, 支持 ***自定义预设*** 和 **_云端同步_** 功能, 支持预设克隆, 预设头像设置, 预设简介设置
     ![预设设置](/screenshot/mask.png)
     ![预设编辑](/screenshot/mask-editor.png)
  11. **支持站点公告** 支持站点公告和通知
  12. **支持偏好设置**, i18n 多语言支持, 自定义最大携带会话数, 最大回复 tokens 数, 模型参数自定义, 重置设置等
     ![偏好设置](/screenshot/settings.png)
  13. **国际化支持**, 支持多语言切换
  14. **附加功能** _(可通过后台系统设置设置附加功能的用户分组权限来开启和关闭)_
      - *[停止支持]* 🍎 **AI 项目生成器功能**,  支持生成过程查看,  支持 TAR / ZIP 格式下载 *(原理为预设实现, 可能不稳定)*
      - *[停止支持]* 📂 **批量文章生成功能**, 支持生成进度条, 一键生成 DOCX 文档的 TAR / ZIP 格式下载 *(需要生成数量高于上游该模型的最高并发数)*
      - *[已弃用]* 🥪 **AI 卡片功能** (已废弃), AI 的问题和答案以卡片形式展现, 可直接以图片 url 形式嵌入。*(原理为动态生成 SVG)*
- 🔔 丰富用户管理和计费体系
  1. **丰富且美观的仪表盘**, 包含本日和当月入账信息, 订阅人数, 模型使用统计折线图, 饼状图分析, 收入统计, 用户类型统计, 模型使用统计, 请求次数和模型错误数量统计图表等
     ![仪表盘](/screenshot/admin.png)
  2. **支持用户管理**, *用户列表*, *用户详情*, *管理操作* (*修改密码*, *修改邮箱*, *封禁 / 解封用户*, *设为管理员*, *点数变更*, *点数设置*, *订阅管理*, *订阅等级设置*, *释放订阅用量* 等操作)
  3. **支持礼品码和兑换码管理** 支持管理操作, 支持批量生成和保存为文件
  4. **价格设定**, 支持模型价格设定 (_**次数计费**_, **_Token 弹性计费_**, _**不计费**_ 等类型), 支持同步上游 Chat Nio 站点的价格设定 (可选是否覆盖本站已有模型价格规则), 未设定价格模型检测 (如果非管理员将自动检测并停止使用模型进而防止金额损失)
     ![购买点数](/screenshot/shop.png)
     ![价格设定](/screenshot/charge.png)
  5. **订阅设定**, 区别于弹性计费, 订阅是一种固定按次的价格的计费方式, 平台用户可以通过套餐以固定价格订阅, 支持是否开启订阅 (默认关闭), 支持订阅分层, 支持订阅配额设置, 支持订阅配额涵盖模型设置, 图标设置, 从其他套餐的配额导入等功能。
     ![订阅计划](/screenshot/subscription.png)
     ![订阅设置](/screenshot/plan.png)
  6. **自定义模型市场**, 编辑前台模型市场模型名称, 介绍, Tags, 头像 (内置模型图片选择和自定义模型图片设置), 是否加入模型模型等信息
     ![模型市场设置](/screenshot/admin-market.png)
  7. **系统设置**, 自定义网站名称, 网站 Logo, 文档链接, 是否暂停注册, 用户初始点数等设置, 自定义购买链接 (卡密发卡地址), 联系信息, 页脚信息等
     ![系统设置](/screenshot/system.png)
  8. **支持 SMTP 发件**, 支持是否启用邮件后缀白名单, 支持自定义邮件后缀白名单
  9. **支持模型缓存**, *即同一个入参下, 如果之前已请求过, 将直接返回缓存结果 (击中缓存将不计费), 减少请求次数。可自定义一种情况的最大缓存结果数 (默认为 1), 自定义可缓存的模型 (默认为空), 自定义缓存时间 (默认为 1 小时), 支持一键设置 *全部模型不缓存*, *免费模型缓存*, *所有模型缓存* 等操作*
- ⚡ 渠道管理体系
  1. Chat Nio **自写渠道分配算法** (不依赖 http 上下文), 抽象 Adapter 兼容层架构, 低耦合, 高可扩展性
  2. **支持多渠道管理**, 支持**优先级调配**, **权重负载**, **渠道状态管理**等 _(优先级是在模型请求过程中, 渠道的优先级分配, 优先级越高, 越先被使用, 如果报错, 将自动 fall 至优先级更低的渠道；权重是指在一个优先级下, 渠道的权重, 权重越高, 被使用的概率越大, 同一个优先级的多个渠道最多只能有一个被使用, 权重越高, 被击中的概率越大)_
  3. **兼容多种格式**, 支持多模型兼容层, 详情参见下方模型支持部分
  4. **支持自定义模型**, 可通过 *添加模型* 使用已知模型, 支持增加自定义模型, 支持一键填入模板模型 (指当前格式默认支持的模板模型, 如 OpenAI 格式的模板模型有 *gpt-3.5-turbo-0613* 等), 支持一键清空模型
  5. **支持渠道重试**, 支持渠道的 Retry 机制, 支持自定义重试次数, 重试次数超过后将自动 fall)
  6. **支持同渠道均衡负载**, 单个渠道内可配置多个密钥而非批量创建渠道 (多个密钥换行间隔), 以相同权重随机分配请求,  Retry 机制也将和同渠道内的多密钥搭配使用, 随机抽取密钥进行重试。
  7. **支持渠道模型映射**, 将模型映射至本渠道已支持模型中, 格式为 *目标模型*>*已有模型*, 加如前缀 `!` 即可让已有模型不分配在本渠道的请求击中的涵盖模型中, 具体使用方法请参考程序内的渠道设置内的说明和提示。
  8. **支持用户分组**, 自定义勾选可使用此模型的用户分组 (如 _匿名用户_, _普通用户_, _基础版订阅用户_, _标准版订阅用户_, _专业版订阅用户_ 等分组, 设置为 0 分组可用和设置为全部分组可用都是一样的效果)
  9. **内置上游隐藏**, 报错时自动隐藏渠道内设置的上游地址 (如 _**channel://2**/v1/chat/completions_), 同时支持隐藏秘钥 (_Gemini 说的就是你 不隐藏秘钥报错直接把秘钥甩出去_), 以防止上游渠道在未设置秘钥或者上游错误信息暴露完整秘钥的情况下 (如逆向类型渠道) 被滥用, 同时在多个渠道同时为同一接入点的情况下, 也方便排查问题
  ![渠道设置](/screenshot/channel.png)
  ![渠道分组](/screenshot/channel-group.png)
- ✨ 中转 API 服务
  1. 以 OpenAI 通用格式兼容多种格式, 支持多模型兼容层, 这意味着你可以使用一种格式, 同时兼容多家 AI 模型
  2. 将 `https://api.openai.com` 替换为 `https://api.chatboom.net` (示例), 填入控制台中的 `API 设置` 中的 API Key 即可使用, 支持重置 Key。
  3. 支持格式
    - [x] Chat Completions _(/v1/chat/completions)_
    - [x] Image Generation _(/v1/images)_
    - [x] Model List _(/v1/models)_
    - [x] Dashboard Billing _(/v1/billing)_
- 🎃 更多功能等待你的发现


## 🔨 支持模型
- [x] OpenAI
  - [x] Chat Completions (support *vision*, *tools_calling* and *function_calling*)
  - [x] Image Generation
- [x] Azure OpenAI
- [x] Anthropic Claude (support *vision*)
- [x] Slack Claude (deprecated)
- [x] Sparkdesk (support *function_calling*)
- [x] Google Gemini (PaLM2)
- [x] New Bing (creative, balanced, precise)
- [x] ChatGLM (turbo, pro, std, lite)
- [x] DashScope Tongyi (plus, turbo)
- [x] Midjourney
    - [x] Mode Toggling (relax, fast, turbo)
    - [x] Support U/V/R Actions
- [x] Tencent Hunyuan
- [x] Baichuan AI
- [x] Moonshot AI
- [x] Groq Cloud AI
- [x] ByteDance Skylark (support *function_calling*)
- [x] 360 GPT
- [x] LocalAI (Stable Diffusion, RWKV, LLaMa 2, Baichuan 7b, Mixtral, ...) _*requires local deployment_


## 📦 部署
*部署成功后, 管理员账号为 `root`, 密码默认为 `123456`*
docker部署原项目，编译安装本项目

1. ⚡ Docker Compose 安装 (推荐)
    
    > 运行成功后, 宿主机映射地址为 `http://localhost:8000`

    ```shell
    git clone --depth=1 --branch=main --single-branch https://github.com/Deeptrain-Community/chatnio.git
    cd chatnio
    docker-compose up -d # 运行服务
   # 如需使用 stable 版本, 请使用 docker-compose -f docker-compose.stable.yaml up -d 替代
   # 如需使用 watchtower 自动更新, 请使用 docker-compose -f docker-compose.watch.yaml up -d 替代
    ```
   
   版本更新（_开启 Watchtower 自动更新的情况下, 无需手动更新_）：
   ```shell
   docker-compose down 
   docker-compose pull
   docker-compose up -d
   ```
   
   > - MySQL 数据库挂载目录项目 ~/**db**
   > - Redis 数据库挂载目录项目 ~/**redis**
   > - 配置文件挂载目录项目 ~/**config**

2. ⚡ Docker 安装 (轻量运行时, 常用于外置 _MYSQL/RDS_ 服务)
    > 如需使用 stable 版本, 请使用 `programzmh/chatnio:stable` 替代 `programzmh/chatnio:latest`  
    ```shell
   docker run -d --name chatnio \
      --network host \
      -p 8000:8094 \
      -v ~/config:/config \
      -v ~/logs:/logs \
      -v ~/storage:/storage \
      -e MYSQL_HOST=localhost \
      -e MYSQL_PORT=3306 \
      -e MYSQL_DB=chatnio \
      -e MYSQL_USER=root \
      -e MYSQL_PASSWORD=chatnio123456 \
      -e REDIS_HOST=localhost \
      -e REDIS_PORT=6379 \
      -e SECRET=secret \
      -e SERVE_STATIC=true \
      programzmh/chatnio:latest
    ```
   > - *--network host* 指使用宿主机网络, 使 Docker 容器使用宿主机的网络, 可自行修改
   > - *-p 8000:8094* 指映射宿主机端口为 8000, 可自行修改冒号前的端口号
   > - SECRET: JWT 密钥, 自行生成随机字符串修改
   > - SERVE_STATIC: 是否启用静态文件服务 (正常情况下不需要更改此项, 详见下方常见问题解答)
   > - *-v ~/config:/config* 挂载配置文件, *-v ~/logs:/logs* 挂载日志文件的宿主机目录, *-v ~/storage:/storage* 挂载附加功能的生成文件
   > - 需配置 MySQL 和 Redis 服务, 请自行参考上方信息修改环境变量
    
    版本更新 （_开启 Watchtower 后无需手动更新, 执行后按照上述步骤重新运行即可_）：
    ```shell
    docker stop chatnio
    docker rm chatnio
    docker pull programzmh/chatnio:latest
   ```

3. ⚒ 编译安装 (自定义性强)
    > 部署成功后, 默认端口为 **8094**, 访问地址为 `http://localhost:8094`
    > Config 配置项 (~/config/**config.yaml**) 可以使用环境变量进行覆盖, 如 `MYSQL_HOST` 环境变量可覆盖 `mysql.host` 配置项

    ```shell
    git clone https://github.com/BoomTeam2018/chatboom.git
    cd chatboom
   
    cd app
    npm install -g pnpm
    pnpm install
    pnpm build
   
    cd ..
    go build -o chatboom
   
    nohup ./chatboom > output.log & # using nohup to run in background
    ```

## ❓ 常见问题 Q&A
1. **为什么我部署后的站点可以访问页面, 可以登录注册, 但是无法使用聊天 (一直在转圈)？**
   - 聊天等此类功能通过 websocket 进行通信, 请确保你的服务支持 websocket。 (Tip: 中转通过 Http 实现, 无需 websocket 支持)
   - 如果你使用了 Nginx, Apache 等反向代理, 请确保已配置 websocket 支持。
   - 如果使用了端口映射, 端口转发, CDN, API Gateway 等服务, 请确保你的服务支持并开启 websocket。
2. **我配置的 Midjourney Proxy 格式的渠道一直转圈或报错 `please provide available notify url`**
   - 若为转圈，请确保你的 Midjourney Proxy 服务已正常运行, 并且已配置正确的上游地址。
   - **Midjourney 要填渠道类型要用 Midjourney 而不是 OpenAI (不知道为什么很多人填成了 OpenAI 类型格式然后过来反馈为什么empty response, mj-chat 类除外)**
   - 排查完这些问题后, 请查看你的系统设置中的**后端域名**是否已经配置并配置正确。如果不配置, 将导致 Midjourney Proxy 服务无法正常回调。
3. **此项目有什么外部依赖？**
   - MySQL: 存储用户信息, 对话记录, 管理员信息等持久化数据。
   - Redis: 存储用户快速鉴权信息, IP 速率限制, 订阅配额, 邮箱验证码等数据。
   - 环境未配置好的情况下, 会导致服务无法正常运行, 请确保你的 MySQL 和 Redis 服务已正常运行 (Docker 部署, 编译部署需自行搭建外部服务)。
4. **我的机器为 ARM 架构, 该项目支持 ARM 架构吗？**
   - 支持。Chat Nio 项目使用 BuildX 构建多架构镜像, 你可以直接使用 docker-compose 或 docker 运行, 无需额外配置。
   - 如果你使用编译安装, 直接在 ARM 机器上编译即可, 无需欸外配置。如果你使用 x86 机器编译, 请使用 `GOARCH=arm64 go build -o chatnio` 进行交叉编译并上传至 ARM 机器上运行。
5. **如何修改 Root 默认密码？**
   - 请点击右上角头像或侧边栏底部用户框进入后台管理, 点击系统设置下常规设置操作栏的 修改 Root 密码 进行修改。或者选择在 用户管理 中选定 root 用户进行修改密码操作。
6. **系统设置中的后端域名是什么？**
   - 后端域名是指后端 API 服务的地址, 默认为你访问站点后加 `/api` 的地址, 如 `https://example.com/api` 。
   - 如果设置为非 *SERVE_STATIC* 模式, 开启前后端分离部署, 请将后端域名设置为你的后端 API 服务地址, 如 `https://api.example.com`。
   - 后端域名此处用于 Midjourney Proxy 服务的后端回调地址, 如无需使用 Midjourney Proxy 服务, 请忽略此设置。
7. **如何配置支付方式？**
   - Chat Nio 开源版支持发卡模式, 设置系统设置中的购买链接为你的发卡地址即可。卡密可通过用户管理中兑换码管理中批量生成。
8. **礼品码和兑换码有什么区别？**
   - 礼品码一种类型只能一个用户只能绑定一次, 而非 aff code, 发福利等方式可使用礼品码, 可在头像下拉菜单中的礼品码中兑换。
   - 兑换码一种类型可以多个用户绑定, 可作为正常购买和发卡使用, 可在用户管理中的兑换码管理中批量生成, 在头像下拉菜单的点数（菜单第一个）内输入兑换码进行兑换。
   - 一个例子：比如我发了一个类型为 *新年快乐* 的福利, 此时推荐使用礼品码, 假设发放 100 个 66 点数, 如果为兑换码, 手快的一个用户就批量把所有兑换码的 6600 点数都用完了, 而礼品码则可以保证每个用户只能使用一次 (获得 66 点数)。
   - 而搭建发卡的时, 如果用礼品码, 因为一个类型只能兑换一次, 购买多个礼品码会导致兑换失败, 而兑换码则可以在此场景下使用。
9. **该项目支持 Vercel 部署吗？**
   - Chat Nio 本身并不支持 Vercel 部署, 但是你可以使用前后端分离模式,  Vercel 部署前端部分, 后端部分使用 Docker 部署或编译部署。
10. **前后端分离部署模式是什么？**
    - 正常情况下, 前后端在同一服务内, 后端地址为 `/api`。前后端分离部署指前端和后端分别部署在不同的服务上, 前端服务为静态文件服务, 后端服务为 API 服务。
      - 举个例子, 前端使用 Nginx (或 Vercel 等) 部署, 部署的域名为 `https://www.chatboom.net`。
      - 后端使用 Docker 部署, 部署的域名为 `https://api.chatboom.net`。
    - 此种部署方式需自行打包前端, 配置环境变量 `VITE_BACKEND_ENDPOINT` 为你的后端地址, 如 `https://api.chatboom.net`。
    - 配置后端环境变量的 `SERVE_STATIC=false` 使后端服务不提供静态文件服务。
11. **弹性计费和订阅详解**
    - 弹性计费, 即 `点数`, 其图标类似于**云**, 模型计费通用方式, 为了防止虚假汇率, 写死 10 点数 = 1 元, 汇率可以在计费规则中的 **应用内置模板** 中自定义汇率。
    - 订阅, 即订阅计划, 为固定价格计费方式按次配额, 订阅计费扣取点数 (举例: 如果站点的用户想订阅 32 元的计划, 则需要保证点数大于等于 320 点数)
    - 订阅是 Item 的组合, 每个 Item 都可设置涵盖的模型, 订阅配额 (-1 为无限使用), 名称, ID (用于区分不同的 Item), 图标等。可在后台的订阅管理中进行操作, 是否开启订阅, 订阅价格等, 修改每个订阅等级的 Item, 以及支持直接导入其他订阅等级的 Item。
    - 订阅支持分层并写死为三个等级。 等级分别为: _普通用户 (0)_, _基础版订阅 (1)_, _标准版订阅 (2)_, _专业版订阅 (3)_, 订阅等级即为用户分组, 可在渠道管理中进行高级设置, 选择勾选可使用此模型的用户分组。
    - 订阅配额设置, 可在订阅管理中进行操作, 是否支持中转 API (默认关闭)
12. **可请求最小点数检测 `user quota is not enough` 详解**
    - 为防止站点用户滥用站点模型, 当请求点数低于最小请求点数时将返回点数不足的错误信息, 大于等于最小请求点数时将正常请求。
    - 模型的最小可请求点数规则: 
        - 不计费模型无限制
        - 次数计费模型最小点数为该模型的 1 次请求点数 (e.g. 若一个模型的单次请求点数为 0.1 点数, 则最小请求点数为 0.1 点数)
        - Token 弹性计费模型为 1K 输入 Tokens 价格 + 1K 输出 Tokens 价格 (e.g. 若一个模型的 1K 输入 Tokens 价格为 0.05 点数, 1K 输出 Tokens 价格 0.1 点数, 则最小请求点数为 0.15 点数)
13. **DuckDuckGo API 搭建避坑**
    - 首先感谢 Binjie 作者的 [duckduckgo-api](https://github.com/binjie09/duckduckgo-api) 项目, 该项目为 Chat Nio 提供了联网搜索功能 (prompt 实现)。
    - DDG API 服务需要自行搭建, Binjie 作者的默认站点中时常配额被用尽, 请自行搭建并在系统设置中联网设置中设置。
    - DuckDuckGo **无法在国内环境使用**, 请使用代理或海外服务器进行搭建 DDG API 端点。
    - 部署成功后请测试 `https://your.domain/search?q=hi` 来简单测试是否搭建成功，如若无法访问，请检查你的 DDG API 服务是否正常运行或寻找原项目寻求帮助。
    - 部署成功后, 请前往系统设置中的联网设置, 设置你的 DDG API 端点地址 (不要加后缀 `/search`), 最大结果数默认为 `5` (结果数设置为 0 或负数默认为 5)
    - 现在聊天中开启联网搜索后即可正常使用, 如若还无法使用, 一般为模型问题 (如 GPT-3.5 有时会无法理解)。
    - 此联网搜索通过预设实现, 意为保证全模型都支持的通用功能, 兼容性无法保证灵敏性, 不依赖模型 Function Calling, 其他本身支持联网的模型可以选择直接关闭此功能。
14. **为何我的 GPT-4-All 等逆向模型无法使用上传文件中的图片?**
    - 上传模型图片为 Base64 格式, 如果逆向不支持 Base64 格式, 请使用 URL 直链而非上传文件做法。
15. **如何开始域名严格跨域检测?**
    - 正常情况下，后端对所有域名开放跨域。如果非特殊需求，无需开启严格跨域检测。
    - 如果需要开启严格跨域检测，可以在后端环境变量中 并配置 `ALLOW_ORIGINS`, 如 `ALLOW_ORIGINS=chatboom.net,chatboom.app` （不需要加协议前缀, www 解析无需手动添加, 后端将自动识别并允许跨域）, 这样就会支持严格跨域检测 (如 *http://www.chatboom.app*, *https://chatboom.net* 等将会被允许, 其他域名将会被拒绝)。
    - 即使在开启严格跨域检测的情况下, /v1 接口会被仍然允许所有域的跨域请求, 以保证中转 API 的正常使用。
16. **模型映射功能是如何使用的？**
    - 渠道内的模型映射格式为 `[from]>[to]`, 多个映射之间换行, **from** 为请求的模型, **to** 为真实向上游发送的模型并且需要上游真实支持
    - 如: 我有一个逆向渠道, 填写 `gpt-4-all>gpt-4`, 则我的用户请求 **gpt-4-all** 模型到该渠道时, 后端则会模型映射至 **gpt-4** 向该渠道请求 **gpt-4**, 此时该渠道支持 2 个模型, **gpt-4** 和 **gpt-4-all** (本质上都为 **gpt-4**)
    - 如果我不想让我的这个逆向渠道影响到 **gpt-4** 的渠道组, 可以加前缀 `!gpt-4-all>gpt-4`, 该渠道 **gpt-4** 则会被忽略, 此时该渠道将只支持 1 个模型, **gpt-4-all** (但本质上为 **gpt-4**)
## 📦 技术栈
- 前端: React + Radix UI + Tailwind CSS + Shadcn + Tremor + Redux
- 后端: Golang + Gin + Redis + MySQL
- 应用技术: PWA + WebSocket

## 📚 SDKs
> API 分为中转 API 和 Chat Nio 独有功能 API
> 
> 中转 API 为 OpenAI 通用格式, 支持多种格式, 详见 OpenAI API 文档和 SDKs
> 
> 下方 SDKs 为 Chat Nio 独有功能 API 的 SDKs

- [JavaScript SDK](https://github.com/Deeptrain-Community/chatnio-api-node)
- [Python SDK](https://github.com/Deeptrain-Community/chatnio-api-python)
- [Golang SDK](https://github.com/Deeptrain-Community/chatnio-api-go)
- [Java SDK](https://github.com/hujiayucc/ChatNio-SDK-Java) (感谢 [@hujiayucc](https://github.com/hujiayucc))
- [PHP SDK](https://github.com/hujiayucc/ChatNio-SDK-Php) (感谢 [@hujiayucc](https://github.com/hujiayucc))
## ✨ 优秀开源项目
> **此处偏前端项目指偏向用户聊天界面的项目, 偏后端项目指偏向于 API 中转和管理的项目, 一站式指包含用户聊天界面和 API 中转和管理的项目*
- [Next Chat @yidadaa](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) （偏前端项目）
- [Lobe Chat @arvinxx](https://github.com/lobehub/lobe-chat) （偏前端项目）
- [Chat Box @bin-huang](https://github.com/Bin-Huang/chatbox) （偏前端项目）
- [OpenAI Forward @kenyony](https://github.com/KenyonY/openai-forward) （偏后端项目）
- [One API @justsong](https://github.com/songquanpeng/one-api) （偏后端项目）
- [New API @calon](https://github.com/Calcium-Ion/new-api) （偏后端项目）
- [FastGPT @labring](https://github.com/labring/FastGPT) （知识库）
- [Quivr @quivrhq](https://github.com/StanGirard/quivr) （知识库）
- [Bingo @weaigc](https://github.com/weaigc/bingo) （模型库）
- [Midjourney Proxy @novicezk](https://github.com/novicezk/midjourney-proxy) （模型库）

## 📄 开源协议
Apache License 2.0

## ❤ 捐助

## 写在最后

- 相对于 NextChat 等偏前端轻量部署的项目,  Chat Nio 优势在于更便捷的云端同步、账号管理、更丰富的分享等功能, 以及计费管理系统。
- 相对于 OneAPI 等偏后端轻量部署的项目,  Chat Nio 优势在于更丰富的用户界面, 同时渠道管理体系功能更多, 更丰富的用户管理, 并推出偏向用户界面的订阅管理系统。

一站式服务的优势在于, 用户可以在一个站点上完成所有的操作, 无需频繁切换站点, 更加便捷。
包括查看自己的点数, 消息的点数消耗, 订阅配额都更加便捷, 使用聊天界面的同时, 开放了中转 API 和 Chat Nio 独有功能 API。

同时力求做到 Chat Nio > Next Chat + One API, 实现更加丰富的功能和更加细节的体验。

感谢原项目作者及其贡献者的努力，因为有你们，社区越发蓬勃发展。

我们非常欢迎 PR 贡献, 并献上我们的感谢。
