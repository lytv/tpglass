# Architecture Research: Translation Feature

**Domain:** Electron Desktop App - Translation Integration
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

Translation integrates into existing Electron multi-window architecture by adding:
- A new `TranslationService` in `src/features/listen/translation/` (reusing existing AI provider patterns)
- Settings storage via electron-store (same as model settings)
- A new UI toggle in SettingsView (following existing settings patterns)
- Translated transcript display in SttView (extending existing transcript flow)

The translation feature follows the same IPC patterns as Save Transcript (v1.0) and uses existing AI provider infrastructure (OpenAI, Gemini, Anthropic) for the actual translation API calls.

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐ │
│  │   SettingsView  │    │   ListenView     │    │      SttView       │ │
│  │                 │    │                  │    │                    │ │
│  │ - Translation   │    │ - Translation   │    │ - Original text    │ │
│  │   toggle        │    │   toggle (opt)  │    │ - Translated text  │ │
│  │ - Target lang   │    │                  │    │ - Dual display     │ │
│  │   selector      │    │                  │    │                    │ │
│  └────────┬────────┘    └────────┬─────────┘    └────────┬─────────┘ │
│           │                       │                        │            │
│           └───────────────────────┼────────────────────────┘            │
│                                   │                                     │
│                            ┌──────▼──────┐                              │
│                            │   preload    │                              │
│                            │     api     │                              │
│                            └──────┬──────┘                              │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │ ipcRenderer.invoke()
┌──────────────────────────────────┼──────────────────────────────────────┐
│                         Main Process                                     │
├──────────────────────────────────┼──────────────────────────────────────┤
│                          ┌───────▼───────┐                              │
│                          │featureBridge  │  ← IPC handlers              │
│                          └───────┬───────┘                              │
│              ┌───────────────────┼───────────────────┐                 │
│    ┌─────────▼─────────┐  ┌─────▼─────┐  ┌─────────▼─────────┐       │
│    │  TranslationSvc   │  │ Settings   │  │    SttService    │       │
│    │                   │  │  Service   │  │                  │       │
│    │ - translate()     │  │ - get/set │  │ - transcript     │       │
│    │ - getLanguages()  │  │ translation│  │   storage        │       │
│    │ - cache results   │  │   settings │  │                  │       │
│    └─────────┬─────────┘  └──────┬──────┘  └──────────────────┘       │
│              │                   │                                      │
│    ┌─────────▼───────────────────▼─────────┐                           │
│    │        AI Provider Factory             │                           │
│    │  (OpenAI / Gemini / Anthropic)        │                           │
│    └────────────────────────────────────────┘                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## New Components Required

### 1. TranslationService (`src/features/listen/translation/translationService.js`)

**Responsibility:** Handles translation API calls and caching

**Key Methods:**
- `translate(text, targetLang, sourceLang?)` - Main translation function
- `getAvailableLanguages()` - Returns supported languages
- `translateBatch(messages, targetLang)` - Batch translate transcript messages

**Integration:**
- Uses existing AI provider factory (same pattern as summaryService)
- Reuses modelStateService for API key management
- Stores translations in memory during session (no persistence needed)

### 2. Settings Integration

**Location:** `electron-store` (existing pattern)

**Settings keys:**
```javascript
{
  translationEnabled: boolean,    // Default: false
  targetLanguage: string,        // Default: 'en'
  translationProvider: string    // Default: 'openai' (uses existing API keys)
}
```

### 3. Preload API Extensions

**File:** `src/preload.js`

**New APIs to add:**
```javascript
// settingsView namespace
settingsView: {
  getTranslationSettings: () => ipcRenderer.invoke('settings:get-translation'),
  setTranslationEnabled: (enabled) => ipcRenderer.invoke('settings:set-translation-enabled', enabled),
  setTargetLanguage: (lang) => ipcRenderer.invoke('settings:set-target-language', lang),
}

// listenView namespace (optional - trigger translation manually)
listenView: {
  translateTranscript: (text) => ipcRenderer.invoke('listen:translate-transcript', text),
}
```

### 4. FeatureBridge Handlers

**File:** `src/bridge/featureBridge.js`

**New handlers:**
```javascript
// Translation settings
ipcMain.handle('settings:get-translation', async () => await settingsService.getTranslationSettings());
ipcMain.handle('settings:set-translation-enabled', async (event, enabled) => await settingsService.setTranslationEnabled(enabled));
ipcMain.handle('settings:set-target-language', async (event, lang) => await settingsService.setTargetLanguage(lang));

// Translation execution
ipcMain.handle('listen:translate-transcript', async (event, { text, targetLang }) =>
  await translationService.translate(text, targetLang));
```

---

## Integration Points with Existing System

### Integration Point 1: electron-store (Settings)

**Existing:** `src/features/settings/settingsService.js`

**Changes needed:**
- Add translation settings to default settings object
- Add getter/setter methods for translation settings
- Settings automatically persist via existing electron-store

**Code location:** Lines 202-219 in settingsService.js (getDefaultSettings)

### Integration Point 2: SttView (Transcript Display)

**Existing:** `src/ui/listen/stt/SttView.js`

**Changes needed:**
- Add `translatedMessages` property (mirrors `sttMessages` structure)
- Add toggle to show/hide translations
- Render both original and translated text (or toggle between them)

**Current flow:**
```
Speech → sttService → IPC 'stt-update' → SttView.sttMessages → render()
```

**New flow with translation:**
```
Speech → sttService → IPC 'stt-update' → SttView.sttMessages
                                      ↓
                              (if translation enabled)
                                      ↓
                            translationService.translate()
                                      ↓
                            SttView.translatedMessages
                                      ↓
                                   render()
```

### Integration Point 3: SettingsView (UI)

**Existing:** `src/ui/settings/SettingsView.js`

**Changes needed:**
- Add translation toggle button (similar to auto-update toggle)
- Add target language dropdown selector
- Load/save settings via preload API

**Pattern to follow:** See `handleToggleAutoUpdate()` method (lines 559-576)

### Integration Point 4: AI Provider Factory

**Existing:** `src/features/common/ai/factory.js`

**Changes needed:**
- No changes needed - translation reuses existing LLM providers
- TranslationService will call `createLLM()` with translation prompt

---

## Data Flow Changes

### Original Transcript Flow
```
User speaks → Microphone → Audio capture → STT API → transcript text
                                                      ↓
                                              SttView.sttMessages[]
                                                      ↓
                                                   Render
```

### New Flow with Translation
```
User speaks → Microphone → Audio capture → STT API → transcript text
                                                      ↓
                                              SttView.sttMessages[]
                                    (if translation enabled)
                                                      ↓
                                    Get text → TranslationService.translate()
                                                      ↓
                                              Translated text
                                                      ↓
                              SttView.translatedMessages OR display toggle
                                                      ↓
                                                   Render
```

### Settings Change Flow
```
User toggles translation in Settings
        ↓
SettingsView calls window.api.settingsView.setTranslationEnabled(true)
        ↓
preload.js → ipcRenderer.invoke('settings:set-translation-enabled', true)
        ↓
featureBridge.js → ipcMain.handle('settings:set-translation-enabled')
        ↓
settingsService.setTranslationEnabled(true) → electron-store
        ↓
Broadcast 'settings-updated' event to all windows
        ↓
ListenView receives event → enables translation for new transcripts
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `translationService.js` | Translation API calls, caching | AI factory, settingsService |
| `settingsService.js` | Persist/retrieve translation settings | electron-store, featureBridge |
| `SettingsView.js` | Render translation settings UI | preload API |
| `SttView.js` | Display original + translated text | ListenView, IPC events |
| `featureBridge.js` | Route translation IPC requests | main process services |
| `preload.js` | Expose translation APIs to renderer | contextBridge |

---

## Build Order (Recommended)

### Phase 1: Backend Infrastructure
1. **Add translation settings to electron-store** (settingsService.js)
   - Add default translation settings
   - Add getter/setter methods
2. **Add IPC handlers** (featureBridge.js)
   - Register translation settings handlers
   - Register translation execution handler

**Rationale:** No UI dependencies, can be built and tested independently.

### Phase 2: Preload API
3. **Expose translation APIs** (preload.js)
   - Add settingsView.getTranslationSettings()
   - Add settingsView.setTranslationEnabled()
   - Add settingsView.setTargetLanguage()

**Rationale:** Depends on IPC handlers existing.

### Phase 3: Translation Service
4. **Create TranslationService** (new file)
   - Implement translate() using AI provider factory
   - Implement getAvailableLanguages()
   - Add simple in-memory caching

**Rationale:** Depends on AI factory pattern (already exists).

### Phase 4: UI Integration
5. **Add translation settings UI** (SettingsView.js)
   - Add toggle button (similar to auto-update)
   - Add language selector dropdown
6. **Extend SttView for translations** (SttView.js)
   - Add translatedMessages property
   - Add translation toggle in UI
   - Render translated text alongside/instead of original

**Rationale:** Depends on preload APIs and service.

### Phase 5: Integration & Polish
7. **Wire up settings change listener** in ListenView
8. **Add translation loading indicator**
9. **Error handling** - show error state if translation fails

---

## Architectural Patterns to Follow

### Pattern 1: Service Handler with IPC Wrapper

TranslationService follows the same pattern as summaryService:

```javascript
// translationService.js
async translate(text, targetLang, sourceLang = 'auto') {
  const provider = await modelStateService.getSelectedLLMProvider();
  const apiKey = await modelStateService.getApiKey(provider);

  const llm = createLLM({ apiKey, model: 'gpt-4.1' });

  const prompt = `Translate the following text to ${targetLang}.
If source language is specified, translate from ${sourceLang} to ${targetLang}.

Text to translate:
${text}`;

  const result = await llm.generateContent([prompt]);
  return result.response.text();
}
```

### Pattern 2: Settings Listener Pattern

ListenView should listen for settings changes (existing pattern):

```javascript
// In ListenView connectedCallback()
window.api.settingsView.onSettingsUpdated((event, settings) => {
  if (settings.translationEnabled !== undefined) {
    this.translationEnabled = settings.translationEnabled;
    this.requestUpdate();
  }
});
```

### Pattern 3: Dual Display Pattern

SttView can show both original and translated (or toggle):

```javascript
// In SttView render()
return html`
  <div class="transcription-container">
    ${this.sttMessages.map(msg => html`
      <div class="stt-message ${this.getSpeakerClass(msg.speaker)}">
        <div class="original-text">${msg.text}</div>
        ${this.translationEnabled && this.translatedMessages?.get(msg.id) ? html`
          <div class="translated-text">${this.translatedMessages.get(msg.id)}</div>
        ` : ''}
      </div>
    `)}
  </div>
`;
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Translation During Speech Recognition

**What:** Try to translate each partial transcript in real-time
**Why bad:** Too many API calls, partial text translation is poor quality
**Instead:** Translate only final transcripts, or batch translate on session end

### Anti-Pattern 2: Storing Translations Persistently

**What:** Save translations to database/file
**Why bad:** Unnecessary complexity, translations are session-specific
**Instead:** Keep translations in memory during session only

### Anti-Pattern 3: Blocking UI During Translation

**What:** Make synchronous translation API call
**Why bad:** Freezes UI, poor UX
**Instead:** Use async/await, show loading indicator

### Anti-Pattern 4: New Translation API Key

**What:** Require user to get a new API key for translation
**Why bad:** Friction for users, existing keys already work
**Instead:** Reuse existing LLM API keys (OpenAI/Gemini/Anthropic)

---

## Scalability Considerations

| Scale | Approach |
|-------|----------|
| 0-100 users | Single translation call per message |
| 100-10K users | Batch translations, add caching |
| 10K+ users | Consider translation queue, rate limiting |

### Translation Caching

For efficiency, implement simple caching:

```javascript
// In translationService
const translationCache = new Map();

async translate(text, targetLang) {
  const cacheKey = `${text.slice(0, 50)}:${targetLang}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const result = await callTranslationAPI(text, targetLang);
  translationCache.set(cacheKey, result);

  return result;
}
```

---

## Sources

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/api/ipc-main)
- [Electron contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- Existing codebase patterns in:
  - `src/features/listen/summary/summaryService.js` - AI service pattern
  - `src/features/common/ai/providers/openai.js` - LLM provider pattern
  - `src/features/settings/settingsService.js` - Settings pattern
  - `src/ui/settings/SettingsView.js` - Settings UI pattern
- Context7: electron, openai, lit (web components)

---

*Architecture research for: Translation Feature (v1.1)*
*Researched: 2026-03-07*
