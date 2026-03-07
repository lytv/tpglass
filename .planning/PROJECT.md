# PickleGlass - Save Transcript Feature

## Current Milestone: v1.1 Translation Feature

**Goal:** Add ability to translate transcripts to a target language, controllable via Settings.

**Target features:**
- Translation toggle in Settings (enable/disable)
- Target language selector in Settings
- Translated transcript display in Listen view
- Translation service using existing API keys

## What This Is

Add ability to save Listen transcript to a local .txt file with a "Save" button in the desktop app UI. This feature extends the existing Listen (speech-to-text) functionality by allowing users to export their transcripts for offline use.

## Core Value

Users can export their speech-to-text transcripts from Listen sessions to local .txt files, enabling offline access and sharing.

## Requirements

### Validated

- ✓ Listen (speech-to-text) functionality — existing
- ✓ Transcript data stored in SttView.sttMessages array — existing
- ✓ SttView.getTranscriptText() returns formatted text — existing
- ✓ Copy functionality in ListenView.handleCopy() — existing
- ✓ IPC pattern (ipcMain.handle / ipcRenderer.invoke) — existing
- ✓ User can save transcript to local .txt file via Save button — v1.0
- ✓ Save dialog allows choosing file location and name — v1.0
- ✓ Transcript text is written to selected file — v1.0

### Active

- [ ] Translation toggle in Settings (enable/disable)
- [ ] Target language selector in Settings
- [ ] Translation service using existing API keys
- [ ] Translated transcript display in Listen view

### Out of Scope

- Export to formats other than .txt (PDF, DOC, etc.) — defer to future
- Auto-save transcripts — not requested
- Cloud export — local file only for v1

## Context

**Technical Environment:**
- Electron desktop app with multi-window architecture
- Existing transcript handling in SttView.js
- IPC communication via featureBridge.js and preload.js
- Copy functionality already implemented as reference implementation

**Current State (v1.0 shipped):**
- Save Transcript feature implemented in:
  - `src/bridge/featureBridge.js` — IPC handler for file save
  - `src/preload.js` — listenView.saveTranscript API
  - `src/ui/listen/ListenView.js` — Save button with success/error states

## Constraints

- **Platform**: Desktop app (Electron) — file system access required
- **Export Format**: .txt file — simplest implementation for v1
- **UI Pattern**: Follow existing Copy button pattern for consistency
- **IPC**: Use existing IPC bridge pattern for main process file operations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use native Save dialog | Standard OS UX, ensures valid file path | ✓ Good — Works as expected |
| Export as .txt | Simplest implementation, universal compatibility | ✓ Good — Users can open anywhere |
| Follow Copy button pattern | Consistent UI, proven IPC pattern | ✓ Good — Reduced implementation time |
| Default filename format | transcript-{YYYY-MM-DD-HHMM}.txt | ✓ Good — Clear and timestamped |

---

*Last updated: 2026-03-07 after v1.1 milestone started*
