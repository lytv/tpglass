# Feature Research

**Domain:** Speech-to-Text Translation Feature (v1.1)
**Researched:** 2026-03-07
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Translation toggle (enable/disable) | Users need control over whether translation runs. Standard pattern in browsers (Chrome, Edge) and translation apps. Without toggle, feature feels invasive. | LOW | Follows existing settings pattern from v1.0 |
| Target language selector | Users must specify what language to translate into. Not optional. | LOW | Can reuse existing language picker UI from STT settings |
| Translated transcript display | Core value proposition. Users see translated text. | MEDIUM | Requires layout decision (split view vs toggle) |
| Translation service integration | Need API to perform translation. Google Cloud Translation, Azure, or OpenAI. | MEDIUM | Existing STT uses API keys - reuse pattern |
| Error handling for API failures | Translation APIs can fail (network, quota, invalid key). Users need feedback. | LOW | Show error in UI, allow retry |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Side-by-side (split) original + translation | Allows users to compare original and translation. Improves trust in accuracy. | MEDIUM | Desktop app has screen space; mobile typically does toggle |
| Auto-detect source language | Eliminates need to specify input language. Convenience factor. | LOW | Translation APIs (Google, Azure) support this |
| Copy translation button | Quick export to clipboard. Complementary to Save Transcript feature. | LOW | Reuses existing copy pattern from ListenView |
| Translation status indicator | Shows "Translating..." during API call. Manages expectations. | LOW | Prevents user confusion during latency |
| Per-sentence translation toggle | Let user choose which sentences to translate. Fine-grained control. | HIGH | Complex UI; may be overkill for v1.1 |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time (streaming) translation during speech | "Translate as I speak" | Adds significant complexity. Requires WebSocket/polling, handles partial results, increases latency concerns. | Translate completed transcript after speech ends |
| Offline translation | "Work without internet" | Requires local ML model download (100MB+). Adds weight, complexity, may not work well. | Use API-based translation for v1.1 |
| Audio-to-audio (speech-to-speech) translation | "Hear the translation" | Not in scope. Requires TTS synthesis, voice conversion. | Keep text-only translation |
| Multi-target language (translate to multiple at once) | "See all languages" | UI complexity, API cost multiplication. | Single target language selector |
| Translation history/persistence | "Keep translations for later" | Not requested. Would require database changes. | Translate current session only |
| Auto-translate without user action | "Just translate everything" | Users may not want translation always on. Requires explicit enable. | Require toggle ON before translating |

## Feature Dependencies

```
Existing: Listen (speech-to-text) → Transcript data available
Existing: Settings system → Language preference storage

New: Translation toggle (Settings)
     ↓
New: Target language selector (Settings)
     ↓
New: Translation service integration (main process)
     ↓
New: Translated transcript display (ListenView)
```

### Dependency Notes

- **Translation toggle requires settings storage:** Use existing electron-store pattern from v1.0
- **Target language selector requires language list:** Can source from translation API or hardcode common languages
- **Translation service requires IPC:** Add `ipcMain.handle()` for translation, similar to save-transcript
- **Display requires state management:** Track original + translated text, toggle between them

## MVP Definition

### Launch With (v1.1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Translation toggle in Settings** — Enable/disable translation globally
- [ ] **Target language selector in Settings** — Dropdown for target language
- [ ] **Translation service integration** — API call to translate transcript text
- [ ] **Translated transcript display in Listen view** — Show translation below or toggle with original
- [ ] **Error handling** — Show error message if translation fails

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Copy translation button** — Quick action to copy translated text
- [ ] **Translation status indicator** — "Translating..." during API call
- [ ] **Auto-detect source language** — Use API's language detection
- [ ] **Split view (side-by-side)** — Show original and translation together

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Real-time translation during speech** — Streaming translation
- [ ] **Multiple target languages** — Translate to several languages at once
- [ ] **Translation history** — Store past translations
- [ ] **Offline translation** — Local ML model

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Translation toggle | HIGH | LOW | P1 |
| Target language selector | HIGH | LOW | P1 |
| Translation service integration | HIGH | MEDIUM | P1 |
| Translated transcript display | HIGH | MEDIUM | P1 |
| Error handling | HIGH | LOW | P1 |
| Copy translation button | MEDIUM | LOW | P2 |
| Translation status indicator | MEDIUM | LOW | P2 |
| Auto-detect source language | MEDIUM | LOW | P2 |
| Split view display | MEDIUM | MEDIUM | P2 |
| Real-time translation | HIGH | HIGH | P3 |
| Offline translation | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Otter.ai | Notta | Our Approach |
|---------|----------|-------|--------------|
| Translation support | Yes (some plans) | Yes | Yes - v1.1 core feature |
| Language selection | Yes | Yes (58+ languages) | Yes - reuse STT pattern |
| Real-time translation | Limited | Yes | No - defer to future |
| Side-by-side view | Yes | Yes | Yes - P2 |
| Copy translation | Yes | Yes | Yes - P2 |
| Offline translation | No | Limited | No - not for v1.1 |

**Analysis approach:** Based on web research of competitor translation features and translation app UI patterns.

## Implementation Notes

### Technical Pattern (from codebase)

The existing Copy button (`ListenView.handleCopy()`) uses:
1. Get transcript text via `sttView.getTranscriptText()`
2. Use `navigator.clipboard.writeText()` for clipboard

Translation should follow similar pattern:
1. Get transcript text via `sttView.getTranscriptText()`
2. Send to main process via IPC (`ipcRenderer.invoke()`)
3. Main process calls translation API
4. Main process returns translated text
5. ListenView displays translated text

### Translation API Options

| API | Languages | Pricing | Complexity |
|-----|-----------|---------|------------|
| Google Cloud Translation | 100+ | Free tier: 500K chars/month | Medium |
| Azure Translator | 70+ | Free tier available | Medium |
| OpenAI (GPT) | 100+ | Pay per token | Medium-High |

### UX Pattern: Toggle Translation Display

For MVP, use a simple toggle in ListenView:
- Button: "Show Translation" / "Show Original"
- Or icon button to swap views
- Translation stored separately from original transcript

### UX Pattern: Translation Toggle in Settings

Following Chrome/Edge pattern:
- Toggle switch with clear ON/OFF labels
- Label: "Enable Translation" or "Translate Transcripts"
- Changes take effect immediately (no restart needed)

## Sources

- [Google Cloud Translation API](https://cloud.google.com/translate) — Translation API reference, supports 100+ languages
- [Microsoft Azure Speech Translation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-translation) — Real-time speech translation documentation
- [UI Components for Translation Apps](https://hereandnowai.com/ui-components-translation-apps/) — UX patterns for translation apps
- [Toggle UX Best Practices](https://www.eleken.co/blog-posts/toggle-ux) — Toggle switch design guidelines
- [Notta Multilingual Transcription](https://www.notta.ai/en/multilingual-transcription) — Example of transcript + translation display
- [TurboScribe Translation](https://turboscribe.ai/free-multi-language-transcription) — Speech-to-text with translation example

---
*Feature research for: Translation Feature (v1.1)*
*Researched: 2026-03-07*
