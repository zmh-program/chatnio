<div align="center">

![chatnio](/app/public/logo.png)

# [🥳 Chat Nio](https://chatnio.com)

#### 🚀 Next Generation AIGC One-Stop Business Solution

#### *"Chat Nio > [Next Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) + [One API](https://github.com/songquanpeng/one-api)"*


English · [简体中文](./README_zh-CN.md) · [Official Website](https://chatnio.com) · [Community](https://chatnio.com/guide/#%F0%9F%9B%A0%EF%B8%8F-%E7%A7%81%E6%9C%89%E5%8C%96%E9%83%A8%E7%BD%B2) · [Developer Resources](https://chatnio.com/developers)


[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/M86XJI)

[![Chat Nio: #1 Repo Of The Day](https://trendshift.io/api/badge/repositories/6369)](https://trendshift.io/repositories/6369)

<img alt="Chat Nio Preview" src="./screenshot/chatnio.png" width="100%" style="border-radius: 8px">

</div>

## 📝 Features
1. 🤖️ **Rich Model Support**: Multi-model service provider support (OpenAI / Anthropic / Gemini / Midjourney and more than ten compatible formats & private LLM support)
2. 🤯 **Beautiful UI Design**: UI compatible with PC / Pad / Mobile, following [Shadcn UI](https://ui.shadcn.com) & [Tremor Charts](https://blocks.tremor.so) design standards, rich and beautiful interface design and backend dashboard
3. 🎃 **Complete Markdown Support**: Support for **LaTeX formulas** / **Mermaid mind maps** / table rendering / code highlighting / chart drawing / progress bars and other advanced Markdown syntax support
4. 👀 **Multi-theme Support**: Support for multiple theme switching, including **Light Mode** for light themes and **Dark Mode** for dark themes. 👉 [Custom Color Scheme](https://github.com/Deeptrain-Community/chatnio/blob/main/app/src/assets/globals.less)
5. 📚 **Internationalization Support**: Support for internationalization, multi-language switching 🇨🇳 🇺🇸 🇯🇵 🇷🇺 👉 Welcome to contribute translations [Pull Request](https://github.com/Deeptrain-Community/chatnio/pulls)
6. 🎨 **Text-to-Image Support**: Support for multiple text-to-image models: **OpenAI DALL-E**✅ & **Midjourney** (support for **U/V/R** operations)✅ & Stable Diffusion✅ etc.
7. 📡 **Powerful Conversation Sync**: **Zero-cost cross-device conversation sync support for users**, support for **conversation sharing** (link sharing & save as image & share management), **no need for WebDav / WebRTC and other dependencies and complex learning costs**
8. 🎈 **Model Market & Preset System**: Support for customizable model market in the backend, providing model introductions, tags, and other parameters. Site owners can customize model introductions according to the situation. Also supports a preset system, including **custom presets** and **cloud synchronization** functions.
9. 📖 **Rich File Parsing**: **Out-of-the-box**, supports file parsing for **all models** (PDF / Docx / Pptx / Excel / image formats parsing), **supports more cloud image storage solutions** (S3 / R2 / MinIO etc.), **supports OCR image recognition** 👉 See project [Chat Nio Blob Service](https://github.com/Deeptrain-Community/chatnio-blob-service) for details (supports Vercel / Docker one-click deployment)
10. 🌏 **Full Model Internet Search**: Based on the [SearXNG](https://github.com/searxng/searxng) open-source engine, supports rich search engines such as Google / Bing / DuckDuckGo / Yahoo / Wikipedia / Arxiv / Qwant, supports safe search mode, content truncation, image proxy, test search availability, and other functions.
11. 💕 **Progressive Web App (PWA)**: Supports PWA applications & desktop support (desktop based on [Tauri](https://github.com/tauri-apps/tauri))
12. 🤩 **Comprehensive Backend Management**: Supports beautiful and rich dashboard, announcement & notification management, user management, subscription management, gift code & redemption code management, price setting, subscription setting, custom model market, custom site name & logo, SMTP email settings, and other functions
13. 🤑 **Multiple Billing Methods**: Supports 💴 **Subscription** and 💴 **Elastic Billing** two billing methods. Elastic billing supports per-request billing / token billing / no billing / anonymous calls and **minimum request points** detection and other powerful features
14. 🎉 **Innovative Model Caching**: Supports enabling model caching: i.e., under the same request parameter hash, if it has been requested before, it will directly return the cached result (hitting the cache will not be billed), reducing the number of requests. You can customize whether to cache models, cache time, multiple cache result numbers, and other advanced cache settings
15. 🥪 **Additional Features** (Support Discontinued): 🍎 **AI Project Generator Function** / 📂 **Batch Article Generation Function** / 🥪 **AI Card Function** (Deprecated)
16. 😎 **Excellent Channel Management**: Self-written excellent channel algorithm, supports ⚡ **multi-channel management**, supports 🥳**priority** setting for channel call order, supports 🥳**weight** setting for load balancing probability distribution of channels at the same priority, supports 🥳**user grouping**, 🥳**automatic retry on failure**, 🥳**model redirection**, 🥳**built-in upstream hiding**, 🥳**channel status management** and other powerful **enterprise-level functions**
17. ⭐ **OpenAI API Distribution & Proxy System**: Supports calling various large models in **OpenAI API** standard format, integrates powerful channel management functions, only needs to deploy one site to achieve simultaneous development of B/C-end business💖
18. 👌 **Quick Upstream Synchronization**: Channel settings, model market, price settings, and other settings can quickly synchronize with upstream sites, modify your site configuration based on this, quickly build your site, save time and effort, one-click synchronization, quick launch
19. 👋 **SEO Optimization**: Supports SEO optimization, supports custom site name, site logo, and other SEO optimization settings to make search engines crawl faster, making your site stand out👋
20. 🎫 **Multiple Redemption Code Systems**: Supports multiple redemption code systems, supports gift codes and redemption codes, supports batch generation, gift codes are suitable for promotional distribution, redemption codes are suitable for card sales, for gift codes of one type, a user can only redeem one code, which to some extent reduces the situation of one user redeeming multiple times in promotions😀
21. 🥰 **Business-Friendly License**: Adopts the **Apache-2.0** open-source license, friendly for commercial secondary development & distribution (please also comply with the provisions of the Apache-2.0 license, do not use for illegal purposes)

> ### ✨ Chat Nio Professional Version
> ![Commercial Version Preview](./screenshot/chatnio-pro.png)
> - ✅ Midjourney Proxy Plus
> - ✅ More Payment Methods & Order Management
> - ✅ Security Audit
> - ✅ Plugin Marketplace

## 📦 Tech Stack
- 🥗 Frontend: React + Redux + Radix UI + Tailwind CSS
- 🍎 Backend: Golang + Gin + Redis + MySQL
- 🍒 Application Technology: PWA + WebSocket

## ✨ Excellent Open Source Projects
> **Frontend-oriented projects here refer to projects that focus on user chat interfaces, backend-oriented projects refer to projects that focus on API proxying and distribution, and one-stop solutions include both user chat interfaces and API proxying and management*
- [Next Chat @yidadaa](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) (Frontend-oriented project)
- [Lobe Chat @arvinxx](https://github.com/lobehub/lobe-chat) (Frontend-oriented project)
- [Chat Box @bin-huang](https://github.com/Bin-Huang/chatbox) (Frontend-oriented project)
- [OpenAI Forward @kenyony](https://github.com/KenyonY/openai-forward) (Backend-oriented project)
- [One API @justsong](https://github.com/songquanpeng/one-api) (Backend-oriented project)
- [New API @calon](https://github.com/Calcium-Ion/new-api) (Backend-oriented project)
- [FastGPT @labring](https://github.com/labring/FastGPT) (Knowledge Base)
- [Quivr @quivrhq](https://github.com/StanGirard/quivr) (Knowledge Base)
- [Bingo @weaigc](https://github.com/weaigc/bingo) (Model Library)
- [Midjourney Proxy @novicezk](https://github.com/novicezk/midjourney-proxy) (Model Library)

## 🤯 Why Create This Project & Project Advantages
We found that most AIGC commercial sites on the market are frontend-oriented lightweight deployment projects with beautiful UI interface designs,
such as the commercial version of [Next Chat](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web).
Due to its personal privatization-oriented design, there are some limitations in secondary commercial development, presenting some issues, such as:
  - **Difficult conversation synchronization**, for example, requiring services like WebDav, high user learning costs, and difficulties in real-time cross-device synchronization.
  - **Insufficient billing**, for example, only supporting elastic billing or only subscription-based, unable to meet the needs of different users.
  - **Inconvenient file parsing**, for example, only supporting uploading images to an image hosting service first, then returning to the site to input the URL direct link in the input box, without built-in file parsing functionality.
  - **No support for conversation URL sharing**, for example, only supporting conversation screenshot sharing, unable to support conversation URL sharing (or only supporting tools like ShareGPT, which cannot promote the site).
  - **Insufficient channel management**, for example, the backend only supports OpenAI format channels, making it difficult to be compatible with other format channels. And only one channel can be filled in, unable to support multi-channel management.
  - **No API call support**, for example, only supporting user interface calls, unable to support API proxying and management.

Another type is API distribution-oriented sites with powerful distribution systems, such as projects based on [One API](https://github.com/songquanpeng/one-api).
Although these projects support powerful API proxying and management, they lack interface design and some C-end features, such as:
  - **Insufficient user interface**, for example, only supporting API calls, without built-in user interface chat. User interface chat requires manually copying the key and going to other sites to use, which has a high learning cost for ordinary users.
  - **No subscription system**, for example, only supporting elastic billing, lacking billing design for C-end users, unable to meet different user needs, and not user-friendly in terms of cost perception for users without a foundation.
  - **Insufficient C-end features**, for example, only supporting API calls, not supporting conversation synchronization, conversation sharing, file parsing, and other functions.
  - **Insufficient load balancing**, the open-source version does not support the **weight** parameter, unable to achieve balanced load distribution probability for channels at the same priority ([New API](https://github.com/Calcium-Ion/new-api) also solves this pain point, with a more beautiful UI).

Therefore, we hope to combine the advantages of these two types of projects to create a project that has both a powerful API distribution system and a rich user interface design,
thus meeting the needs of C-end users while developing B-end business, improving user experience, reducing user learning costs, and increasing user stickiness.

Thus, **Chat Nio** was born. We hope to create a project that has both a powerful API distribution system and a rich user interface design, becoming the next-generation open-source AIGC project's one-stop commercial solution.

## ❤ Donations

If you find this project helpful, you can give it a Star to show your support!
