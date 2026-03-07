# Stack Research

**Domain:** Electron Desktop App Translation Feature
**Researched:** 2026-03-07
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| OpenAI Chat Completions API | Latest (GPT-4o/gpt-4o-mini) | Text translation via chat prompts | Already integrated in app, supports 100+ languages, cost-effective with gpt-4o-mini |
| Existing openai SDK | ^4.70.0 | API client | Already in use by app, no new dependencies needed |
| Existing electron-store | Latest | Store translation settings (enable/disable, target language) | Already in use for settings, no new dependencies |
| Existing IPC pattern | Established | Main-renderer communication | Already proven pattern in codebase |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Translation uses existing OpenAI SDK via chat completions |

### Translation Implementation Pattern

The Translation feature extends existing infrastructure:

1. **Settings Storage (electron-store):**
   ```javascript
   // Add to settings defaults in settingsService.js
   translation: {
     enabled: false,
     targetLanguage: 'en'
   }
   ```

2. **Main Process Translation Service (translationService.js - NEW):**
   ```javascript
   const OpenAI = require('openai');

   async function translateText(text, targetLanguage, apiKey) {
     const client = new OpenAI({ apiKey });

     const response = await client.chat.completions.create({
       model: 'gpt-4o-mini',
       messages: [
         {
           role: 'system',
           content: `You are a professional translator. Translate the following text to ${targetLanguage}. Preserve the original formatting and meaning. Only output the translated text, nothing else.`
         },
         {
           role: 'user',
           content: text
         }
       ],
       temperature: 0.3
     });

     return response.choices[0].message.content;
   }
   ```

3. **IPC Handler (featureBridge.js):**
   ```javascript
   ipcMain.handle('translate:text', async (event, { text, targetLanguage }) => {
     const modelStateService = global.modelStateService;
     const apiKey = await modelStateService.getApiKey('openai');

     if (!apiKey) {
       return { success: false, error: 'No API key configured' };
     }

     try {
       const translated = await translateText(text, targetLanguage, apiKey);
       return { success: true, translated };
     } catch (error) {
       return { success: false, error: error.message };
     }
   });
   ```

4. **Preload API (preload.js):**
   ```javascript
   listenView: {
     translate: (text, targetLanguage) =>
       ipcRenderer.invoke('translate:text', { text, targetLanguage }),
   }
   ```

5. **Renderer (ListenView.js - Translation toggle):**
   ```javascript
   async handleTranslate() {
     const settings = await window.api.settings.getSettings();
     if (!settings.translation?.enabled) return;

     const sttView = this.shadowRoot.querySelector('stt-view');
     const textToTranslate = sttView ? sttView.getTranscriptText() : '';
     const targetLang = settings.translation?.targetLanguage || 'en';

     const result = await window.api.listenView.translate(textToTranslate, targetLang);

     if (result.success) {
       this.translatedText = result.translated;
     }
   }
   ```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| OpenAI Chat API | Anthropic Claude API | If user prefers Anthropic or already has Anthropic key |
| gpt-4o-mini | gpt-4o | When higher quality needed (costs ~10x more) |
| Chat completions | Dedicated translation API | Only if specific translation features needed beyond chat |

### Using Anthropic Instead

If the user prefers using their existing Anthropic API key:

```javascript
const Anthropic = require('@anthropic-ai/sdk');

async function translateTextAnthropic(text, targetLanguage, apiKey) {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: `You are a professional translator. Translate to ${targetLanguage}. Output only the translation.`,
    messages: [
      { role: 'user', content: text }
    ]
  });

  return response.content[0].text;
}
```

**Recommendation:** Use OpenAI by default because:
- gpt-4o-mini is extremely cost-effective for translation ($0.15/million input tokens)
- The app already uses OpenAI for STT, reducing configuration complexity
- Translation quality is excellent for general-purpose text

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Translate API | Requires separate API key, costs money | OpenAI (uses existing key) |
| LibreTranslate (self-hosted) | Requires server setup, maintenance | OpenAI (simpler) |
| DeepL API | Requires separate API key | OpenAI (uses existing key) |
| Third-party translation npm packages | Most are wrappers around paid APIs | Direct API calls to OpenAI |
| Dedicated translation models | Overkill for this use case | Chat completions with prompt |

## Stack Patterns by Variant

**If user has ONLY Anthropic key (no OpenAI):**
- Use Anthropic SDK with same pattern
- Requires adding @anthropic-ai/sdk to package.json (not currently installed)
- Same IPC pattern, different provider

**If translating in real-time during listening:**
- Consider using gpt-4o-mini-realtime-preview
- More complex - requires WebSocket connection
- Defer for v1.1, add in v1.2 if needed

**If supporting many target languages:**
- OpenAI supports 100+ languages natively
- Language codes follow ISO 639-1 standard

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| openai (^4.70.0) | Node.js 18+, Electron 28+ | Already in package.json |
| electron-store | Electron 28+ | Already in use |
| IPC (ipcMain.handle) | Electron 8+ | Stable pattern |

## Installation

No additional packages required for v1.1 MVP.

**If adding Anthropic support later:**
```bash
npm install @anthropic-ai/sdk
```

## Sources

- OpenAI Platform Documentation: https://platform.openai.com/docs/guides/text-generation
- OpenAI Pricing: https://openai.com/api/pricing/ (gpt-4o-mini is $0.15/million input tokens)
- OpenAI Cookbook - Translation examples: https://cookbook.openai.com/examples/voice_solutions/one_way_translation_using_realtime_api
- Project code: `src/features/common/ai/providers/openai.js` — Existing OpenAI integration
- Project code: `src/features/settings/settingsService.js` — Existing settings pattern
- Project code: `src/bridge/featureBridge.js` — Existing IPC handler pattern

---
*Stack research for: Translation Feature (v1.1)*
*Researched: 2026-03-07*
