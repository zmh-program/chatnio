<div align="center">

![chatnio](/app/public/logo.png)

# [Chat Nio](https://chatnio.net)

_🚀 **下一代 AI 一站式解决方案**_

_🚀 **Next Generation AI One-Stop Solution**_


[Official Website](https://chatnio.net) | [Open Documentation](https://docs.chatnio.net) | [SDKs](https://docs.chatnio.net/kuai-su-kai-shi) | [QQ Group](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=1mv1Y8SyxnQVvQCoqhmIgVTbwQmkNmvQ&authKey=5KUA9nJPR29nQwjbsYNknN2Fj6cKePkRes%2B1QZy84Dr4GHYVzcvb0yklxiMMNVJN&noverify=0&group_code=749482576)

[![code-stats](https://stats.deeptrain.net/repo/Deeptrain-Community/chatnio)](https://stats.deeptrain.net)

</div>

## 📝 Features

- ✨ **AI Chat Conversation**
  1. **Rich Format Compatibility**
     - Supports Vision models, including ***direct image upload*** and ***image direct link or Base64 image input*** functions (like GPT-4 Vision Preview, Gemini Pro Vision, etc.)
     - Supports drawing with DALL-E models
     - Supports **Imagine** / **Upscale** / **Variant** / **Reroll** operations for Midjourney / Niji models
     ![Midjourney](/screenshot/code.png)

  2. **Markdown Support / Theme Switching Support**, supports light and dark modes, code highlighting, LaTeX formulas, tables, progress bars, Virtual Message, etc.
     ![Markdown Message](/screenshot/latex.jpg)

  3. **Support for Message Menu**, including re-answering, copying messages, using messages, editing messages, deleting messages, saving as a file, and more operations...

  4. **Support for Multi-platform Adaptation**, supports PWA apps, desktop platforms (desktop is based on [Tauri](https://github.com/tauri-apps/tauri)).

  5. **Dialogue Memory**, cloud synchronization, native support for direct link sharing of site conversations, supports using shared conversations, saving shared conversations as images, and share management (including viewing, deleting shares, etc.).

  6. **Native Support for Full Model File Parsing**, supports pdf, docx, pptx, xlsx, images, and other formats parsing (for more details, see the project [chatnio-blob-service](https://github.com/Deeptrain-Community/chatnio-blob-service)).

  7. Supports Full-model DuckDuckGo Online Search _(for details, refer to the [duckduckgo-api](https://github.com/binjie09/duckduckgo-api) project, needs to be set up on your own and configured in the internet settings in the system settings, thanks to the author [@binjie09](https://github.com/binjie09))_
     ![Online Search](/screenshot/online.png)

  8.**Full-screen Large Text Editing**, supports *plain text editing*, *edit-preview mode*, *pure preview mode* three mode switching.
     ![Editor](/screenshot/editor.png)

  9. **Model Marketplace**, supports model search, supports drag-and-drop in sequence, includes model name, model description, model Tags, model avatar, automatic binding of model pricing, automatic binding of subscription quotas (models included in the subscription will be tagged with *plus* label)
     ![Model Market](/screenshot/market.png)

  10. **Support for Preset**, supports ***custom presets*** and **_cloud synchronization_** features, supports preset cloning, preset avatar settings, preset introduction settings
    ![Preset Settings](/screenshot/mask.png)
    ![Preset Editing](/screenshot/mask-editor.png)

  11. **Support for Site Announcements** Supports site announcements and notifications
  12. **Support for Preference Settings**, i18n multi-language support, custom maximum number of carry-over sessions, maximum reply tokens number, model parameters customization, reset settings, etc.
    ![Preference Settings](/screenshot/settings.png)

  13. **Additional** _(User group permissions for additional functions can be enabled and disabled through backend system settings)_
    - *[Discontinued]* 🍎 **AI project generator function**, supports viewing of the generation process, supports TAR / ZIP format downloads *(based on presets, may be unstable)*
    - *[Discontinued]* 📂 **Bulk article generation function**, supports progress bar, one-click generation of DOCX documents in TAR / ZIP format download *(requires a generation quantity higher than the highest concurrency number of the upstream model)*
    - *[Deprecated]* 🥪 **AI Card feature** (deprecated), AI questions and answers are presented in the form of cards, can be directly embedded via image url. *(Based on dynamic SVG generation)*
