# PickleGlass - Save Transcript Feature

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

### Active

- [ ] User can save transcript to local .txt file via Save button
- [ ] Save dialog allows choosing file location and name
- [ ] Transcript text is written to selected file

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

**Relevant Prior Work:**
- Transcript data already stored: `SttView.sttMessages` array
- Text extraction method exists: `SttView.getTranscriptText()` (lines 191-193)
- Copy to clipboard exists: `ListenView.handleCopy()` (lines 561-592)
- IPC pattern established: `ipcMain.handle()` in featureBridge.js, `ipcRenderer.invoke()` in preload.js

## Constraints

- **Platform**: Desktop app (Electron) — file system access required
- **Export Format**: .txt file — simplest implementation for v1
- **UI Pattern**: Follow existing Copy button pattern for consistency
- **IPC**: Use existing IPC bridge pattern for main process file operations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use native Save dialog | Standard OS UX, ensures valid file path | — Pending |
| Export as .txt | Simplest implementation, universal compatibility | — Pending |
| Follow Copy button pattern | Consistent UI, proven IPC pattern | — Pending |

---
*Last updated: 2026-03-07 after initialization*
