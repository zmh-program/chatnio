import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getMemory, setMemory } from "@/utils/memory.ts";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      end: ".", // end of sentence
      "not-found": "Page not found",
      home: "Home",
      login: "Login",
      "login-require": "You need to login to use this feature",
      logout: "Logout",
      quota: "Quota",
      "try-again": "Try again",
      "invalid-token": "Invalid token",
      "invalid-token-prompt": "Please try again.",
      "login-failed": "Login failed",
      "login-failed-prompt":
        "Login failed! Please check your token expiration and try again.",
      "login-success": "Login successful",
      "login-success-prompt": "You have been logged in successfully.",
      "server-error": "Server error",
      "server-error-prompt":
        "There was an error logging you in. Please try again.",
      "request-failed":
        "Request failed. Please check your network and try again.",
      close: "Close",
      edit: "Edit",
      conversation: {
        title: "Conversation",
        empty: "Empty",
        "refresh-failed": "Refresh failed",
        "refresh-failed-prompt":
          "There was an error during your request. Please try again.",
        "remove-title": "Are you absolutely sure?",
        "remove-description":
          "This action cannot be undone. This will permanently delete the conversation ",
        "remove-all-title": "Clear History",
        "remove-all-description":
          "This action cannot be undone. This will permanently delete all conversations, continue?",
        cancel: "Cancel",
        delete: "Delete",
        "delete-conversation": "Delete Conversation",
        "delete-success": "Conversation deleted",
        "delete-success-prompt": "Conversation has been deleted.",
        "delete-failed": "Delete failed",
        "delete-failed-prompt":
          "Failed to delete conversation. Please check your network and try again.",
      },
      chat: {
        web: "web searching feature",
        "web-aria": "Toggle web searching feature",
        placeholder: "Write something...",
        recall: "History Recall",
        "recall-desc":
          "Detected that you have unsent messages last time, has been restored for you.",
        "recall-cancel": "Cancel",
      },
      message: {
        copy: "Copy",
        save: "Save as File",
        use: "Use Message",
        "copy-area": "Copy Selected Area",
      },
      "quota-description": "spending quota for the message",
      buy: {
        choose: "Choose an amount",
        other: "Other",
        "other-desc": "How many points?",
        buy: "Buy {{amount}} points",
        dalle: "DALL·E Image Generator",
        "dalle-free": "DALL·E 2 Free Forever",
        flex: "Flexible Billing",
        input: "Input",
        output: "Output",
        "learn-more": "Learn more",
        "dialog-title": "Buy Points",
        "dialog-desc": "Are you sure you want to buy {{amount}} points?",
        "dialog-cancel": "Cancel",
        "dialog-buy": "Buy",
        success: "Purchase successful",
        "success-prompt": "You have successfully purchased {{amount}} points.",
        failed: "Purchase failed",
        "failed-prompt":
          "Failed to purchase points. Please make sure you have enough balance, you will soon jump to deeptrain wallet to pay balance.",
        "gpt4-tip": "Tip: web searching feature may consume more input points",
      },
      pkg: {
        title: "Packages",
        go: "Go to Verify",
        cert: "Certification Package",
        "cert-desc":
          "After real-name certification, you can get 50 points (worth 5 CNY)",
        teen: "Teenager Package",
        "teen-desc":
          "After real-name certification, teenagers (18 years old and below) can get an additional 150 points (worth 15 CNY) and use the Claude 100k model for free forever",
        close: "Close",
        state: {
          true: "Received",
          false: "Not Received",
        },
      },
      sub: {
        title: "Subscription",
        "dialog-title": "Subscription Plan",
        free: "Free",
        "free-price": "Free Forever",
        pro: "Pro",
        "pro-price": "32 CNY/Month",
        "free-gpt3": "GPT-3.5 (16k) Free Forever",
        "free-dalle": "DALL·E 2 Free Forever",
        "free-web": "web searching feature",
        "free-conversation": "conversation storage",
        "free-api": "API calls",
        "pro-gpt4": "GPT-4 50 requests per day",
        "pro-gpt4-desc": "(including GPT 4V, DALL·E 3)",
        "pro-claude": "Claude 100k Free",
        "pro-service": "Priority Service Support",
        "pro-thread": "Concurrency Increase",
        enterprise: "Enterprise",
        "enterprise-service": "Priority Service Support",
        "enterprise-sla": "SLA Guarantee",
        "enterprise-speed": "TPM Speed Increase",
        "enterprise-security": "SOC-2 Standard Data Security Guarantee",
        "enterprise-data": "Offsite Data Disaster Recovery Backup",
        "enterprise-deploy": "Support Private Cloud Deployment",
        "contact-sale": "Contact Sales",
        current: "Current Plan",
        upgrade: "Upgrade",
        renew: "Renew",
        "cannot-select": "Cannot Select",
        "select-time": "Select Subscription Time",
        price: "Price {{price}} CNY",
        expired: "Your subscription will expire in {{expired}} days",
        time: {
          1: "1 Month",
          3: "3 Months",
          6: "6 Months",
          12: "1 Year",
          36: "3 Years",
        },
        success: "Subscribe success",
        "success-prompt":
          "You have successfully subscribed to {{month}} months of Pro.",
        failed: "Subscribe failed",
        "failed-prompt":
          "Failed to subscribe, please make sure you have enough balance, you will soon jump to deeptrain wallet to pay balance.",
      },
      cancel: "Cancel",
      confirm: "Confirm",
      percent: "{{cent}}0%",
      file: {
        upload: "Upload File",
        type: "Support pdf, docx, pptx, xlsx, image, text and other formats",
        drop: "Drag and drop files here or click to upload",
        "parse-error": "Parse Error",
        "parse-error-prompt": "Parse Error: {{reason}}",
        "max-length": "Content too long",
        "max-length-prompt":
          "The content has been truncated due to the context length limit",
        "over-size": "File too large",
        "over-size-prompt":
          "The size of a single attachment cannot exceed {{size}} MB",
        "large-file": "Large File Parsing",
        "large-file-prompt":
          "Uploading and parsing large files, please wait patiently",
        "number": "{{number}} files",
        "zipper": "{{filename}} and {{number}} more ...",
        "empty-file": "Empty File",
        "empty-file-prompt": "File content is empty, has been automatically ignored",
      },
      generate: {
        title: "AI Project Generator",
        "input-placeholder": "generate a python game",
        failed: "Generate failed",
        reason: "Reason: ",
        success: "Generate success",
        "success-prompt":
          "Project generated successfully! Please select the download format.",
        empty: "generating...",
        download: "Download {{name}} format",
      },
      api: {
        title: "API Settings",
        copied: "Copied",
        "copied-description": "API key has been copied to clipboard",
        "learn-more": "Learn more",
      },
      service: {
        title: "New Version Available",
        description: "A new version is available. Do you want to update now?",
        update: "Update",
        "offline-title": "Offline Mode",
        offline: "App is currently offline.",
        "update-success": "Update Success",
        "update-success-prompt": "You have been updated to the latest version.",
      },
      share: {
        title: "Share",
        "share-conversation": "Share Conversation",
        description: "Share this conversation with others: ",
        "copy-link": "Copy Link",
        view: "View",
        success: "Share success",
        failed: "Share failed",
        copied: "Copied",
        "copied-description": "Link has been copied to clipboard",
        "not-found": "Conversation not found",
        "not-found-description":
          "Conversation not found, please check if the link is correct or the conversation has been deleted",
        manage: "Share Management",
        "sync-error": "Sync Error",
        name: "Conversation Title",
        time: "Time",
        action: "Action",
      },
      docs: {
        title: "Open Docs",
      },
      invitation: {
        title: "Redeem Code",
        "input-placeholder": "Please enter the redeem code",
        cancel: "Cancel",
        check: "Check",
        "check-success": "Redeem Success",
        "check-success-description":
          "Redeem Success! You have received {{amount}} points, start your AI journey!",
        "check-failed": "Redeem Failed",
      },
      contact: {
        title: "Contact Us",
      },
      settings: {
        title: "Settings",
        context: "Keep Context",
        align: "Chatbox Centered",
      },
      article: {
        title: "Batch Generate Articles",
        "input-placeholder": "Please enter the article title (one line each)",
        "prompt-placeholder":
          "Please enter the preset (help AI generate articles, such as: academic paper format, 800 words)",
        "web-checkbox": "Whether to enable web search function",
        generate: "Generate",
        "progress-title": "Generating ({{current}}/{{total}})",
        "generate-success": "Generate Success",
        "generate-success-prompt":
          "Article generated successfully! Please select the download format.",
        "generate-failed": "Generate Failed",
        "generate-failed-prompt":
          "Failed to generate article, please check your network and try again.",
        "download-format": "Download {{name}} format",
      },
    },
  },
  cn: {
    translation: {
      end: "",
      "not-found": "页面未找到",
      home: "首页",
      login: "登录",
      "login-require": "您需要登录才能使用此功能",
      logout: "登出",
      quota: "配额",
      "try-again": "重试",
      "invalid-token": "无效的令牌",
      "invalid-token-prompt": "请重试。",
      "login-failed": "登录失败",
      "login-failed-prompt": "登录失败！请检查您的令牌过期时间并重试。",
      "login-success": "登录成功",
      "login-success-prompt": "您已成功登录。",
      "server-error": "服务器错误",
      "server-error-prompt": "登录出错，请重试。",
      "request-failed": "请求失败，请检查您的网络并重试。",
      close: "关闭",
      edit: "编辑",
      conversation: {
        title: "对话",
        empty: "空空如也",
        "refresh-failed": "刷新失败",
        "refresh-failed-prompt": "请求出错，请重试。",
        "remove-title": "是否确定？",
        "remove-description": "此操作无法撤消。这将永久删除对话 ",
        "remove-all-title": "清除历史",
        "remove-all-description":
          "此操作无法撤消。这将永久删除所有对话，是否继续？",
        cancel: "取消",
        delete: "删除",
        "delete-conversation": "删除对话",
        "delete-success": "对话已删除",
        "delete-success-prompt": "对话已删除。",
        "delete-failed": "删除失败",
        "delete-failed-prompt": "删除对话失败，请检查您的网络并重试。",
      },
      chat: {
        web: "联网搜索功能",
        "web-aria": "切换网络搜索功能",
        placeholder: "写点什么...",
        recall: "历史复原",
        "recall-desc": "检测到您上次有未发送的消息，已经为您恢复。",
        "recall-cancel": "取消",
      },
      message: {
        copy: "复制",
        save: "保存为文件",
        use: "使用消息",
        "copy-area": "复制选中区域",
      },
      "quota-description": "消息的配额支出",
      buy: {
        choose: "选择一个金额",
        other: "其他",
        "other-desc": "多少点数？",
        buy: "购买 {{amount}} 点数",
        dalle: "DALL·E AI 绘图",
        "dalle-free": "DALL·E 2 绘图永久免费",
        flex: "灵活计费",
        input: "输入",
        output: "输出",
        "learn-more": "了解更多",
        "dialog-title": "购买点数",
        "dialog-desc": "您确定要购买 {{amount}} 点数吗？",
        "dialog-cancel": "取消",
        "dialog-buy": "购买",
        success: "购买成功",
        "success-prompt": "您已成功购买 {{amount}} 点数。",
        failed: "购买失败",
        "failed-prompt":
          "购买点数失败。请确保您有足够的余额，您即将跳转到 deeptrain 钱包支付余额。",
        "gpt4-tip": "提示：web 联网版功能可能会带来更多的输入点数消耗",
      },
      pkg: {
        title: "礼包",
        go: "前往实名认证",
        cert: "实名认证礼包",
        "cert-desc": "实名认证后可获得 50 点数 （价值 5 元）",
        teen: "未成年人福利",
        "teen-desc":
          "实名认证后未成年人（18 周岁及以下）可额外获得 150 点数 （价值 15 元），并且可以永久免费使用 Claude 100k 模型",
        close: "关闭",
        state: {
          true: "已领取",
          false: "无法领取",
        },
      },
      sub: {
        title: "订阅",
        "dialog-title": "订阅计划",
        free: "免费版",
        "free-price": "永久免费",
        pro: "专业版",
        "pro-price": "32 元/月",
        "free-gpt3": "GPT-3.5 (16k) 永久免费",
        "free-dalle": "DALL·E 2 绘图永久免费",
        "free-web": "联网搜索功能",
        "free-conversation": "对话存储记录",
        "free-api": "API 调用",
        "pro-gpt4": "GPT-4 每日请求 50 次",
        "pro-gpt4-desc": "(包含 GPT 4V, DALL·E 3)",
        "pro-claude": "Claude 100k 免费",
        "pro-service": "优先服务支持",
        "pro-thread": "并发数提升",
        enterprise: "企业版",
        "enterprise-service": "优先技术支持",
        "enterprise-sla": "SLA 保障",
        "enterprise-speed": "TPM 速率提升",
        "enterprise-security": "SOC-2 标准数据安全保障",
        "enterprise-data": "异地数据容灾备份",
        "enterprise-deploy": "支持私有化部署",
        "contact-sale": "联系销售",
        current: "当前计划",
        upgrade: "升级",
        renew: "续费",
        "cannot-select": "无法选择",
        "select-time": "选择订阅时间",
        price: "价格 {{price}} 元",
        expired: "您的订阅还有 {{expired}} 天到期",
        time: {
          1: "1个月",
          3: "3个月",
          6: "半年",
          12: "1年",
          36: "3年",
        },
        success: "订阅成功",
        "success-prompt": "您已成功订阅 {{month}} 月专业版。",
        failed: "订阅失败",
        "failed-prompt":
          "订阅失败，请确保您有足够的余额，您即将跳转到 deeptrain 钱包支付余额。",
      },
      cancel: "取消",
      confirm: "确认",
      percent: "{{cent}}折",
      file: {
        upload: "上传文件",
        type: "支持 pdf, docx, pptx, xlsx, 图像, 文本等格式",
        drop: "拖拽文件到此处或点击上传",
        "parse-error": "解析失败",
        "parse-error-prompt": "解析失败：{{reason}}",
        "max-length": "内容过长",
        "max-length-prompt": "由于上下文长度限制，内容已被截取",
        "over-size": "文件过大",
        "over-size-prompt": "单个附件大小不能超过 {{size}} MB",
        "large-file": "大文件解析",
        "large-file-prompt": "正在上传并解析大文件中，请耐心等待",
        "number": "{{number}} 个文件",
        "zipper": "{{filename}} 和其他 {{number}} 个文件",
        "empty-file": "无内容文件",
        "empty-file-prompt": "文件内容为空，已自动忽略",
      },
      generate: {
        title: "AI 项目生成器",
        "input-placeholder": "生成一个python小游戏",
        failed: "生成失败",
        reason: "原因：",
        success: "生成成功",
        "success-prompt": "成功生成项目！请选择下载格式。",
        empty: "生成中...",
        download: "下载 {{name}} 格式",
      },
      api: {
        title: "API 设置",
        copied: "复制成功",
        "copied-description": "API 密钥已复制到剪贴板",
        "learn-more": "了解更多",
      },
      service: {
        title: "发现新版本",
        description: "发现新版本，是否立即更新？",
        update: "更新",
        "offline-title": "离线模式",
        offline: "应用当前处于离线状态。",
        "update-success": "更新成功",
        "update-success-prompt": "您已更新至最新版本。",
      },
      share: {
        title: "分享",
        "share-conversation": "分享对话",
        description: "将此对话与他人分享：",
        "copy-link": "复制链接",
        view: "查看",
        success: "分享成功",
        failed: "分享失败",
        copied: "复制成功",
        "copied-description": "链接已复制到剪贴板",
        "not-found": "对话未找到",
        "not-found-description":
          "对话未找到，请检查链接是否正确或对话是否已被删除",
        manage: "分享管理",
        "sync-error": "同步失败",
        name: "对话标题",
        time: "时间",
        action: "操作",
      },
      docs: {
        title: "开放文档",
      },
      invitation: {
        title: "兑换码",
        "input-placeholder": "请输入兑换码",
        cancel: "取消",
        check: "验证",
        "check-success": "兑换成功",
        "check-success-description":
          "兑换成功！您已获得 {{amount}} 点数，开始您的 AI 之旅吧！",
        "check-failed": "兑换失败",
      },
      contact: {
        title: "联系我们",
      },
      settings: {
        title: "设置",
        context: "保留上下文",
        align: "聊天框居中",
      },
      article: {
        title: "批量生成文章",
        "input-placeholder": "请输入文章标题（一行一个）",
        "prompt-placeholder":
          "请输入预设（帮助 AI 生成文章，如：学术论文格式，800 字）",
        "web-checkbox": "是否开启联网搜索功能",
        generate: "生成",
        "progress-title": "生成中 （总共 {{total}} 篇， {{current}} 篇已生成）",
        "generate-success": "生成成功",
        "generate-success-prompt": "文章生成成功！请选择下载格式。",
        "generate-failed": "生成失败",
        "generate-failed-prompt": "文章生成失败，请检查您的网络并重试。",
        "download-format": "下载 {{name}} 格式",
      },
    },
  },
  ru: {
    translation: {
      end: "",
      "not-found": "Страница не найдена",
      home: "Главная",
      login: "Войти",
      "login-require": "Вам нужно войти, чтобы использовать эту функцию",
      logout: "Выйти",
      quota: "Квота",
      "try-again": "Попробуйте еще раз",
      "invalid-token": "Неверный токен",
      "invalid-token-prompt": "Пожалуйста, попробуйте еще раз.",
      "login-failed": "Ошибка входа",
      "login-failed-prompt":
        "Ошибка входа! Пожалуйста, проверьте срок действия вашего токена и попробуйте еще раз.",
      "login-success": "Успешный вход",
      "login-success-prompt": "Вы успешно вошли в систему.",
      "server-error": "Ошибка сервера",
      "server-error-prompt":
        "При входе произошла ошибка. Пожалуйста, попробуйте еще раз.",
      "request-failed":
        "Ошибка запроса. Пожалуйста, проверьте свою сеть и попробуйте еще раз.",
      close: "Закрыть",
      edit: "Редактировать",
      conversation: {
        title: "Разговор",
        empty: "Пусто",
        "refresh-failed": "Ошибка обновления",
        "refresh-failed-prompt":
          "При выполнении запроса произошла ошибка. Пожалуйста, попробуйте еще раз.",
        "remove-title": "Вы уверены?",
        "remove-description":
          "Это действие нельзя отменить. Это навсегда удалит разговор ",
        "remove-all-title": "Очистить историю",
        "remove-all-description":
          "Это действие нельзя отменить. Это навсегда удалит все разговоры, продолжить?",
        cancel: "Отмена",
        delete: "Удалить",
        "delete-conversation": "Удалить разговор",
        "delete-success": "Разговор удален",
        "delete-success-prompt": "Разговор был удален.",
        "delete-failed": "Ошибка удаления",
        "delete-failed-prompt":
          "Не удалось удалить разговор. Пожалуйста, проверьте свою сеть и попробуйте еще раз.",
      },
      chat: {
        web: "веб-поиск",
        "web-aria": "Переключить веб-поиск",
        placeholder: "Напишите что-нибудь...",
        recall: "История",
        "recall-desc":
          "Обнаружено, что у вас есть неотправленные сообщения в прошлый раз, они были восстановлены для вас.",
        "recall-cancel": "Отмена",
      },
      message: {
        copy: "Копировать",
        save: "Сохранить как файл",
        use: "Использовать сообщение",
        "copy-area": "Копировать выбранную область",
      },
      "quota-description": "квота расходов на сообщение",
      buy: {
        choose: "Выберите сумму",
        other: "Другое",
        "other-desc": "Сколько очков?",
        buy: "Купить {{amount}} очков",
        dalle: "Генератор изображений DALL·E",
        "dalle-free": "DALL·E 2 бесплатно навсегда",
        flex: "Гибкая тарификация",
        input: "Вход",
        output: "Выход",
        "learn-more": "Узнать больше",
        "dialog-title": "Купить очки",
        "dialog-desc": "Вы уверены, что хотите купить {{amount}} очков?",
        "dialog-cancel": "Отмена",
        "dialog-buy": "Купить",
        success: "Покупка прошла успешно",
        "success-prompt": "Вы успешно приобрели {{amount}} очков.",
        failed: "Покупка не удалась",
        "failed-prompt":
          "Не удалось приобрести очки. Пожалуйста, убедитесь, что у вас достаточно баланса, вы скоро перейдете в кошелек deeptrain для оплаты баланса.",
        "gpt4-tip":
          "Совет: функция веб-поиска может потреблять больше входных очков",
      },
      pkg: {
        title: "Пакеты",
        go: "Перейти к проверке",
        cert: "Пакет сертификации",
        "cert-desc":
          "После сертификации подлинности вы можете получить 50 очков (стоимостью 5 CNY)",
        teen: "Подростковый пакет",
        "teen-desc":
          "После сертификации подлинности подростки (до 18 лет) могут получить дополнительно 150 очков (стоимостью 15 CNY) и бесплатно использовать модель Claude 100k навсегда",
        close: "Закрыть",
        state: {
          true: "Получено",
          false: "Не получено",
        },
      },
      sub: {
        title: "Подписка",
        "dialog-title": "Подписка",
        free: "Бесплатно",
        "free-price": "Бесплатно навсегда",
        pro: "Профессиональный",
        "pro-price": "32 CNY/месяц",
        "free-gpt3": "GPT-3.5 (16k) бесплатно навсегда",
        "free-dalle": "DALE·E 2 бесплатно навсегда",
        "free-web": "веб-поиск",
        "free-conversation": "хранение разговоров",
        "free-api": "API вызовы",
        "pro-gpt4": "GPT-4 50 запросов в день",
        "pro-gpt4-desc": "(включая GPT 4V, DALL·E 3)",
        "pro-claude": "Claude 100k бесплатно",
        "pro-service": "Приоритетная служба поддержки",
        "pro-thread": "Увеличение параллелизма",
        enterprise: "Корпоративный",
        "enterprise-service": "Приоритетная служба поддержки",
        "enterprise-sla": "Гарантия SLA",
        "enterprise-speed": "Увеличение скорости TPM",
        "enterprise-security": "Гарантия безопасности данных SOC-2",
        "enterprise-data": "Резервное копирование данных в другом месте",
        "enterprise-deploy": "Поддержка частной облачной инфраструктуры",
        "contact-sale": "Связаться с отделом продаж",
        current: "Текущая подписка",
        upgrade: "Обновить",
        renew: "Продлить",
        "cannot-select": "Невозможно выбрать",
        "select-time": "Выберите время подписки",
        price: "Цена {{price}} CNY",
        expired: "Ваша подписка истекает через {{expired}} дней",
        time: {
          1: "1 месяц",
          3: "3 месяца",
          6: "6 месяцев",
          12: "1 год",
          36: "3 года",
        },
        success: "Подписка успешна",
        "success-prompt": "Вы успешно подписались на {{month}} месяцев Pro.",
        failed: "Подписка не удалась",
        "failed-prompt":
          "Не удалось подписаться, пожалуйста, убедитесь, что у вас достаточно баланса, вы скоро перейдете в кошелек deeptrain для оплаты баланса.",
      },
      cancel: "Отмена",
      confirm: "Подтвердить",
      percent: "{{cent}}0%",
      file: {
        upload: "Загрузить файл",
        type: "Поддержка pdf, docx, pptx, xlsx, изображений, текста и других форматов",
        drop: "Перетащите файлы сюда или нажмите, чтобы загрузить",
        "parse-error": "Ошибка разбора",
        "parse-error-prompt": "Ошибка разбора: {{reason}}",
        "max-length": "Слишком длинный контент",
        "max-length-prompt":
          "Содержимое было усечено из-за ограничения длины контекста",
        "over-size": "Слишком большой файл",
        "over-size-prompt":
          "Размер одного вложения не может превышать {{size}} MB",
        "large-file": "Большой файл разбора",
        "large-file-prompt":
          "Загрузка и разбор большого файла, пожалуйста, подождите",
        "number": "{{number}} файлов",
        "zipper": "{{filename}} и другие {{number}} файлов",
        "empty-file": "Пустой файл",
        "empty-file-prompt": "Содержимое файла пустое, автоматически проигнорировано",
      },
      generate: {
        title: "Генератор AI проектов",
        "input-placeholder": "сгенерировать python игру",
        failed: "Генерация не удалась",
        reason: "Причина: ",
        success: "Генерация успешна",
        "success-prompt":
          "Проект успешно сгенерирован! Пожалуйста, выберите формат загрузки.",
        empty: "генерация...",
        download: "Загрузить {{name}} формат",
      },
      api: {
        title: "Настройки API",
        copied: "Скопировано",
        "copied-description": "Ключ API скопирован в буфер обмена",
        "learn-more": "Узнать больше",
      },
      service: {
        title: "Доступна новая версия",
        description: "Доступна новая версия. Хотите обновить сейчас?",
        update: "Обновить",
        "offline-title": "Режим оффлайн",
        offline: "Приложение в настоящее время находится в автономном режиме.",
        "update-success": "Обновление успешно",
        "update-success-prompt": "Вы обновились до последней версии.",
      },
      share: {
        title: "Поделиться",
        "share-conversation": "Поделиться разговором",
        description: "Поделитесь этим разговором с другими: ",
        "copy-link": "Скопировать ссылку",
        view: "Посмотреть",
        success: "Поделиться успешно",
        failed: "Поделиться не удалось",
        copied: "Скопировано",
        "copied-description": "Ссылка скопирована в буфер обмена",
        "not-found": "Разговор не найден",
        "not-found-description":
          "Разговор не найден, пожалуйста, проверьте, правильная ли ссылка или разговор был удален",
        manage: "Управление обменом",
        "sync-error": "Ошибка синхронизации",
        name: "Название разговора",
        time: "Время",
        action: "Действие",
      },
      docs: {
        title: "Открыть документы",
      },
      invitation: {
        title: "Код приглашения",
        "input-placeholder": "Введите код приглашения",
        cancel: "Отмена",
        check: "Проверить",
        "check-success": "Успешно",
        "check-success-description":
          "Успешно! Вы получили {{amount}} очков, начните свое путешествие в мир AI!",
        "check-failed": "Не удалось",
      },
      contact: {
        title: "Связаться с нами",
      },
      settings: {
        title: "Настройки",
        context: "Сохранить контекст",
        align: "Выравнивание чата по центру",
      },
      article: {
        title: "Пакет генерации статей",
        "input-placeholder": "Введите заголовок статьи (одна строка)",
        "prompt-placeholder":
          "Введите предустановку (помогите AI сгенерировать статью, например: формат научной статьи, 800 слов)",
        "web-checkbox": "Включить веб-поиск",
        generate: "Генерировать",
        "progress-title":
          "Генерация (всего {{total}} статей, {{current}} статей сгенерировано)",
        "generate-success": "Успешно",
        "generate-success-prompt":
          "Статья успешно сгенерирована! Пожалуйста, выберите формат загрузки.",
        "generate-failed": "Не удалось",
        "generate-failed-prompt":
          "Не удалось сгенерировать статью. Пожалуйста, проверьте свою сеть и попробуйте еще раз.",
        "download-format": "Загрузить {{name}} формат",
      },
    },
  },
};

export const supportedLanguages = ["en", "cn", "ru"];

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStorage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .then(() => console.debug(`[i18n] initialized (language: ${i18n.language})`));

export default i18n;

export function getStorage(): string {
  const storage = getMemory("language");
  if (storage && supportedLanguages.includes(storage)) {
    return storage;
  }
  // get browser language
  const lang = navigator.language.split("-")[0];
  if (supportedLanguages.includes(lang)) {
    return lang;
  }
  return "cn";
}

export function setLanguage(i18n: any, lang: string): void {
  if (supportedLanguages.includes(lang)) {
    i18n
      .changeLanguage(lang)
      .then(() =>
        console.debug(`[i18n] language changed (language: ${i18n.language})`),
      );
    setMemory("language", lang);
    return;
  }
  console.warn(`[i18n] language ${lang} is not supported`);
}
