# Project Research Summary

**Project:** PickleGlass - Save Transcript to File Feature
**Domain:** Electron Desktop App File Save Functionality
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

This research addresses the Save Transcript to File feature for PickleGlass, an Electron-based desktop transcription app. The feature allows users to export their transcribed content to local files. Research indicates this is a straightforward implementation using Electron's built-in APIs (dialog.showSaveDialog and fs.promises) with existing IPC patterns already established in the codebase. No additional dependencies are required. The implementation follows a well-documented pattern: renderer invokes preload API, which sends IPC to main process, which shows native dialog and writes file. Five critical pitfalls were identified, all preventable with proper error handling and IPC architecture. The feature has clear table stakes (native dialog, feedback) and differentiation opportunities (.md export).

## Key Findings

### Recommended Stack

Research confirms Electron's built-in APIs are sufficient. No external libraries needed.

**Core technologies:**
- **Electron dialog.showSaveDialog** — Native OS file picker, provides macOS/Windows native UX, no dependencies
- **Node.js fs.promises** — Asynchronous file writing, reliable and well-tested
- **IPC (ipcMain.handle/ipcRenderer.invoke)** — Secure communication between renderer and main process

The implementation reuses the existing IPC pattern already present in featureBridge.js, following the same approach as the Copy button functionality.

### Expected Features

**Must have (table stakes):**
- Native save dialog — Users expect OS-native file picker
- File type filter (.txt default) — Users select file type via filters option
- Default filename suggestion — Reduces friction with timestamp-based names like `transcript-2026-03-07.txt`
- Success/error feedback — Confirms action completed or shows error with reason
- Keyboard shortcut (Cmd+S) — Power user expectation

**Should have (competitive):**
- Markdown export (.md) — Differentiator, preserves formatting, popular in notes apps
- Remember last save location — Faster repeat saves via electron-store
- Copy path to clipboard — Easy file location reference

**Defer (v2+):**
- PDF export — Requires additional libraries, high complexity
- Cloud storage integration — Adds auth/sync complexity
- Auto-save — Creates file management issues
- Batch export — Only if users request

### Architecture Approach

The system follows a clear layered architecture:

1. **ListenView.js** — UI component with Save button, retrieves transcript text via SttView.getTranscriptText()
2. **preload.js** — Exposes secure IPC bridge via contextBridge, maps invoke calls to named channels
3. **featureBridge.js** — Registers ipcMain.handle() handlers, routes to dialog/fs operations
4. **Electron dialog + fs** — Main process performs privileged operations

Data flow: User clicks Save -> ListenView gets transcript text -> preload API invokes IPC -> featureBridge shows dialog -> fs writes file -> result returned to renderer.

### Critical Pitfalls

1. **Renderer Cannot Access File System** — contextIsolation blocks direct fs access. Must use IPC to main process.
2. **Not Handling Dialog Cancellation** — Check both `canceled` and `!filePath` before writing.
3. **Race Condition - Window Destroyed While Dialog Open** — Verify window exists via `win.isDestroyed()` before using.
4. **Not Handling File Write Errors** — Wrap fs.writeFile in try/catch, return error status to renderer.
5. **Missing Default File Extension** — Set defaultPath with .txt extension to prevent "can't find my file".

## Implications for Roadmap

Based on research, the implementation is straightforward and can be completed in a single phase with careful attention to error handling.

### Phase 1: Save Transcript to File
**Rationale:** This is the core feature. Implementation order is determined by architectural dependencies: IPC handler must exist before preload API, which must exist before UI button.

**Delivers:**
- Native save dialog with .txt filter
- Default filename with timestamp (e.g., transcript-2026-03-07-1430.txt)
- Save button in ListenView (similar to Copy button)
- Success/error feedback in UI

**Addresses features from FEATURES.md:**
- Native save dialog (P1)
- File type filter (P1)
- Default filename (P1)
- Success/error feedback (P1)
- Transcript text extraction via existing SttView.getTranscriptText()

**Avoids pitfalls from PITFALLS.md:**
- Uses IPC to bypass contextIsolation restriction
- Handles dialog cancellation explicitly
- Window validity check before dialog
- Try/catch around file write
- DefaultPath includes .txt extension

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1:** Well-documented Electron IPC patterns, official API docs available, existing codebase examples (Copy button)

No phases require deeper research - all aspects are covered by official Electron documentation and existing codebase patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Uses built-in Electron APIs, verified with official docs |
| Features | HIGH | Standard desktop export functionality, competitor analysis available |
| Architecture | HIGH | Existing IPC pattern in codebase, follows established conventions |
| Pitfalls | HIGH | All identified pitfalls have documented prevention strategies |

**Overall confidence:** HIGH

### Gaps to Address

No major gaps identified. The implementation is well-understood with clear patterns. If any uncertainty arises:
- Test with contextIsolation: true (should work with IPC)
- Verify on both macOS and Windows for dialog differences

## Sources

### Primary (HIGH confidence)
- Electron dialog.showSaveDialog API — Official documentation
- Electron IPC Documentation — Official documentation
- Electron contextBridge — Security patterns
- Project codebase: featureBridge.js, preload.js, ListenView.js — Existing IPC patterns

### Secondary (MEDIUM confidence)
- UX Stack Exchange: Save vs Export — UX conventions
- Competitor analysis: Otter.ai, Descript export features

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
