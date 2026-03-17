# Roadmap: PickleGlass - Translation Feature

## Milestones

- ✅ **v1.0 Save Transcript** — Phase 1 (shipped 2026-03-07)
- ⏳ **v1.1 Translation Feature** — Phases 2-5 (in progress)

---

## Phases

- [x] **Phase 2: Translation Service** - Backend API integration and translation logic
- [ ] **Phase 3: Settings UI** - Toggle and language selector in Settings
- [ ] **Phase 4: Display Integration** - Translated text display and toggle in Listen view
- [x] **Phase 5: Integration & Polish** - End-to-end integration and refinement (completed 2026-03-07)

---

## Phase Details

### Phase 2: Translation Service
**Goal**: Backend translation capability using OpenAI API with caching and error handling

**Depends on**: Phase 1 (existing infrastructure)

**Requirements**: SERV-01, SERV-02, SERV-03

**Success Criteria** (what must be TRUE):
1. TranslationService can translate text from any source language to target language via OpenAI API
2. Translated results are cached by source text hash to avoid redundant API calls for same content
3. Translation failures return original text with error indicator, app continues to function

**Plans**: 1 plan

**Plans**:
- [x] 02-translation-service/02-01-PLAN.md — TranslationService with OpenAI API, caching, and error handling

---

### Phase 3: Settings UI
**Goal**: Users can configure translation preferences in Settings

**Depends on**: Phase 2 (translation service ready)

**Requirements**: SETT-01, SETT-02, SETT-03

**Success Criteria** (what must be TRUE):
1. User can toggle translation ON/OFF in Settings view
2. User can select target language from dropdown list (20+ common languages)
3. Translation settings persist across app restarts via electron-store

**Plans**: 1 plan

**Plans**:
- [x] 03-settings-ui/03-01-PLAN.md — Translation toggle and language selector in Settings

---

### Phase 4: Display Integration
**Goal**: Users can view and interact with translated transcripts in Listen view

**Depends on**: Phase 3 (settings wired up)

**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04

**Success Criteria** (what must be TRUE):
1. User can view translated transcript text in Listen view when translation enabled
2. User can toggle between original and translated text display
3. Loading indicator displays while translation API call is in progress
4. User can copy translated text to clipboard via copy button

**Plans**:
- [x] 04-display-integration/04-01-PLAN.md — Translation display and toggle in Listen view

---

### Phase 5: Integration & Polish
**Goal**: Translation works end-to-end with proper triggers and real-time settings updates

**Depends on**: Phase 4 (display integrated)

**Requirements**: INTG-01, INTG-02

**Success Criteria** (what must be TRUE):
1. Translation automatically triggers when enabled and transcript becomes available
2. Changing translation settings in Settings immediately reflects in Listen view without page reload

**Plans**: 1 plan

**Plans**:
- [x] 05-integration-polish/05-01-PLAN.md — Translation auto-trigger and real-time settings update

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 2 - Translation Service | 1/1 | Complete | 2026-03-07 |
| 3 - Settings UI | 1/1 | Complete | 2026-03-07 |
| 4 - Display Integration | 1/1 | Complete | 2026-03-07 |
| 5 - Integration & Polish | 1/1 | Complete   | 2026-03-12 |
| 05.1 - STT Language Configuration | 1/1 | Complete | 2026-03-08 |
| 05.2 - Microphone Toggle Button | 1/1 | Complete    | 2026-03-09 |
| 05.3 - Add Action Buttons to Transcript Modal | 2/2 | Complete    | 2026-03-12 |
| 05.3.1 - Custom Prompts Settings | 2/2 | Complete    | 2026-03-12 |
| 05.4 - Multi-Select Transcript Detail Display | 2/2 | Complete    | 2026-03-12 |
| 05.4.1 - Keyboard Shortcut for Checkbox Selection | 1/1 | Complete    | 2026-03-13 |
| 05.4.2 - Audio Recording for Listen Feature | 2/2 | Planned | - |

---

*Roadmap updated: 2026-03-17*

### Phase 05.4.2: Audio Recording for Listen Feature (INSERTED)

**Goal:** Automatically record audio when user clicks Listen. When user clicks Stop, save the recording as MP3 file to the same folder as the transcript.

**Requirements**: None specified
**Depends on:** Phase 05.4.1
**Plans:** 2/2 plans

Plans:
- [x] 05.4.2-01-PLAN.md — RecordingService with lame encoding, IPC handlers in featureBridge
- [x] 05.4.2-02-PLAN.md — Preload bridge and listenService integration

### Phase 05.4: Multi-Select Transcript Detail Display (INSERTED)

**Goal:** Allow users to select multiple transcripts from the transcript list and view them together in a modal. When multiple selected, actions (Summarize, Custom Prompt) combine all selected text into one input. Single-select behavior remains as existing.

**Requirements**: None specified
**Depends on:** Phase 5
**Plans**: 2/2 plans complete

Plans:
- [x] 05.4-01-PLAN.md — Checkbox selection UI with hover reveal, multi-panel modal with horizontal scroll
- [x] 05.4-02-PLAN.md — Bulk actions with combined text, selection behavior

### Phase 05.4.1: Keyboard shortcut for checkbox selection (INSERTED)

**Goal:** Add keyboard navigation support for transcript checkbox selection in Listen view. Users can enter selection mode with Space, navigate with Up/Down arrows, toggle selection with Space/Enter, and use Shift+Arrow for range selection.

**Requirements**: None specified
**Depends on:** Phase 05.4
**Plans**: 1/1 plans complete

Plans:
- [x] 05.4.1-01-PLAN.md — Add keyboard navigation state, handlers, and visual focus indicator to SttView.js

### Phase 05.3: Add Action Buttons to Transcript Detail Modal (INSERTED)

**Goal:** Add action buttons (Edit, Summarize, Custom Prompt) to the translation detail modal in SttView.js. Users can edit transcripts inline, generate summaries via LLM, and use custom prompts.

**Requirements**: None specified
**Depends on:** Phase 5
**Plans**: 2/2 plans complete

Plans:
- [x] 05.3-01-PLAN.md — Add 3 action buttons to modal, inline edit, summarize/custom-prompt modals
- [x] 05.3-02-PLAN.md — Backend summarize service with IPC handlers

### Phase 05.3.1: Custom Prompts Settings (INSERTED)

**Goal:** Implement Custom Prompts Settings - allow users to create, edit, delete custom AI prompts in Settings, and execute them from the Custom Prompt modal in SttView.

**Requirements**: None specified
**Depends on:** Phase 5.3
**Plans**: 2/2 plans complete

Plans:
- [x] 05.3.1-01-PLAN.md — Backend service with runCustomPrompt method, IPC handler, preload bridge
- [x] 05.3.1-02-PLAN.md — Settings UI section and SttView modal with dropdown + execution

### Phase 05.2: Add Microphone Toggle Button to prevent acoustic leakage (INSERTED)

**Goal:** Add a microphone toggle button on the Listen view UI to allow users to turn off microphone input to prevent acoustic leakage when they only want transcription from system audio.
**Requirements**: None (urgent feature)
**Depends on:** Phase 5
**Plans**: 1/1 plans complete

Plans:
- [x] 05.2-01-PLAN.md — Add mic toggle button with enableMic/disableMic functions

### Phase 05.1: Thêm cấu hình ngôn ngữ STT cho Deepgram

**Goal:** Add user-configurable Deepgram STT language settings. Users can select their preferred STT language, which persists across sessions.

**Requirements**: None specified

**Depends on:** Phase 5

**Plans**: 1/1 plans complete

Plans:
- [x] 05.1-01-PLAN.md — Add STT language configuration for Deepgram