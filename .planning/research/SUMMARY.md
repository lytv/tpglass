# Project Research Summary

**Project:** Translation Feature (v1.1)
**Domain:** Electron Desktop App - Translation Integration
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

This research synthesizes findings for adding translation capability to the existing PickleGlass speech-to-text Electron app. The translation feature integrates with the current architecture by reusing existing OpenAI SDK, electron-store for settings, and established IPC patterns. No new dependencies are required.

The recommended approach uses OpenAI's chat completions API (gpt-4o-mini) for translation, which reuses existing API keys and infrastructure already in place for STT. The feature follows a 5-phase build order: backend infrastructure (settings storage, IPC handlers), preload API, translation service, UI integration (settings and display), then integration testing.

Key risks identified: translation latency breaking real-time UX expectations, cascading STT errors through translation pipeline, uncontrolled API costs, and lack of graceful degradation when translation APIs fail. These must be addressed in specific phases to prevent user-facing issues.

## Key Findings

### Recommended Stack

**Core technologies:**
- **OpenAI Chat Completions API (gpt-4o-mini)** — Text translation via chat prompts. Already integrated in app, supports 100+ languages, cost-effective at $0.15/million input tokens.
- **Existing openai SDK (^4.70.0)** — API client already in use, no new dependencies.
- **Existing electron-store** — Settings storage for translation enable/disable and target language preference.
- **Existing IPC pattern** — Main-renderer communication already proven in codebase.

**No new packages required for v1.1 MVP.** Uses existing infrastructure exclusively.

### Expected Features

**Must have (table stakes):**
- **Translation toggle** — Enable/disable in Settings. Users expect control over whether translation runs.
- **Target language selector** — Users must specify target language. Reuse existing language picker UI.
- **Translated transcript display** — Core value proposition. Show translated text in ListenView.
- **Error handling** — Show error messages when translation fails, allow retry.

**Should have (competitive):**
- **Side-by-side view** — Compare original and translation. Desktop has screen space.
- **Copy translation button** — Quick export to clipboard. Complementary to Save Transcript.
- **Translation status indicator** — "Translating..." during API call manages expectations.

**Defer (v2+):**
- **Real-time translation during speech** — Requires WebSocket/polling, increases complexity significantly.
- **Offline translation** — Requires local ML model (100MB+), not needed for v1.1.
- **Audio-to-audio (speech-to-speech)** — Requires TTS synthesis, out of scope.

### Architecture Approach

The translation feature extends existing Electron multi-window architecture:

**Major components:**
1. **TranslationService** (`src/features/listen/translation/translationService.js`) — Handles translation API calls using existing AI provider factory, includes caching for efficiency.
2. **SettingsService extension** — Stores translation preferences (enabled, targetLanguage) in electron-store.
3. **Preload API extensions** — Exposes translation settings and execution to renderer via contextBridge.
4. **FeatureBridge handlers** — Routes translation IPC requests in main process.
5. **SttView extension** — Displays original + translated text with toggle option.

**Key pattern:** TranslationService follows same pattern as existing summaryService, reusing modelStateService for API key management and createLLM() for API calls.

### Critical Pitfalls

1. **Translation latency breaks real-time expectation** — Translation adds 200-2000ms API latency. Show original immediately, translated text asynchronously. Add "translating..." indicator.

2. **Cascading STT errors through translation** — STT misrecognitions get locked in. Add visual indicator showing original is editable before translation.

3. **Uncontrolled API costs** — Per-character pricing can spiral. Add character count display, implement caching, add "translate on demand" option.

4. **No graceful degradation when API fails** — Network issues or quota exceeded crashes app. Always return original text with error indicator when translation fails.

5. **Blocking main thread during translation** — Synchronous calls freeze UI. Always use async/await, show loading indicator.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Backend Infrastructure
**Rationale:** No UI dependencies, can be built and tested independently.
**Delivers:** Translation settings in electron-store, IPC handlers in featureBridge.
**Addresses:** Settings storage, error handling foundation.
**Avoids:** PITFALL #4 (no graceful degradation) — handlers include try/catch.

### Phase 2: Preload API
**Rationale:** Depends on IPC handlers from Phase 1.
**Delivers:** Exposed translation APIs via contextBridge.
**Addresses:** Enables renderer to access translation functionality.
**Uses:** Existing IPC pattern from preload.js.

### Phase 3: Translation Service
**Rationale:** Depends on AI provider factory already in codebase.
**Delivers:** TranslationService with translate(), getAvailableLanguages(), caching.
**Implements:** AI provider integration following summaryService pattern.
**Avoids:** PITFALL #3 (API costs) — implement caching in service. PITFALL #5 (blocking UI) — all calls async.

### Phase 4: Settings UI Integration
**Rationale:** Depends on preload APIs and service.
**Delivers:** Translation toggle, target language dropdown in SettingsView.
**Implements:** Settings UI following existing auto-update toggle pattern.
**Avoids:** Settings not wired to functionality.

### Phase 5: ListenView Display Integration
**Rationale:** Depends on all previous phases.
**Delivers:** Translated transcript display with toggle between original/translated.
**Implements:** SttView extension with dual display.
**Avoids:** PITFALL #1 (latency breaking UX) — show original immediately, translate async. PITFALL #2 (STT error propagation) — show original editable.

### Phase Ordering Rationale

- **Phase 1-2 before 3:** Backend and API must exist before service implementation
- **Phase 3 before 4-5:** Service must work before UI consumes it
- **Service (Phase 3) after settings (Phase 1):** Translation needs to know target language from settings
- **Grouping by dependency:** Backend infrastructure isolated first, then service, then UI
- **Pitfall mitigation spread across phases:** Cost controls in Phase 3, graceful degradation in Phase 1-3, latency handling in Phase 5

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Display Integration):** Complex UI state management for dual display, may need additional research on Lit component patterns for translation toggle.

Phases with standard patterns (skip research-phase):
- **Phase 1-3:** Well-documented Electron patterns, reuse existing code patterns directly.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Uses existing infrastructure (OpenAI SDK, electron-store, IPC). No new dependencies. Verified against existing codebase patterns. |
| Features | HIGH | Based on competitor analysis (Otter.ai, Notta) and translation app UX best practices. Clear MVP scope defined. |
| Architecture | HIGH | Researched existing code patterns in summaryService, settingsService, SttView. IPC patterns verified. |
| Pitfalls | MEDIUM-HIGH | Based on general translation API integration patterns and Electron best practices. Some latency/cost issues are theoretical for this scale. |

**Overall confidence:** HIGH

### Gaps to Address

- **Language list source:** Need to verify whether to hardcode common languages or fetch from OpenAI. Recommend hardcoding top 20-30 languages for MVP.
- **Translation quality validation:** No explicit testing of gpt-4o-mini translation quality vs dedicated translation APIs. May need user feedback loop.
- **Caching invalidation:** Cache strategy needs testing — when should translations be re-fetched?

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/features/common/ai/providers/openai.js` — OpenAI integration pattern
- Existing codebase: `src/features/settings/settingsService.js` — Settings pattern
- Existing codebase: `src/bridge/featureBridge.js` — IPC handler pattern
- Existing codebase: `src/ui/settings/SettingsView.js` — Settings UI pattern
- OpenAI Platform Documentation: https://platform.openai.com/docs/guides/text-generation

### Secondary (MEDIUM confidence)
- Google Cloud Translation API Documentation — API limits, pricing comparison
- Competitor analysis: Otter.ai, Notta translation features — Feature landscape
- Translation API Best Practices — Caching, batching recommendations

### Tertiary (LOW confidence)
- UI Components for Translation Apps — UX patterns (general, not Electron-specific)
- Toggle UX Best Practices — General design guidelines

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
