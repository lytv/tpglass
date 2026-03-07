# Phase 1: Save Transcript to File - Research

**Researched:** 2026-03-07
**Domain:** Electron file save dialog + IPC communication
**Confidence:** HIGH

## Summary

This phase implements a "Save Transcript" feature in an Electron desktop app. The implementation requires:
1. Adding an IPC handler in the main process to show native save dialog and write files
2. Exposing a preload API for the renderer to invoke the save dialog
3. Adding a Save button to the ListenView UI (next to existing Copy button)

**Primary recommendation:** Use Electron's built-in `dialog.showSaveDialog` API in the main process, expose via preload using existing IPC patterns, add button to ListenView following existing Copy button implementation.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Default filename format:** `transcript-{YYYY-MM-DD-HHMM}.txt` (e.g., transcript-2026-03-07-1430.txt)
- **Button placement:** Near the Copy button in ListenView for consistency
- **Feedback pattern:** Standard success/error handling as per existing codebase

### Claude's Discretion
- Exact button styling (matching Copy or distinct)
- Error message content
- Empty transcript handling

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FILE-01 | User can click Save button in Listen view to save transcript | IPC handler + preload API + UI button implementation |
| FILE-02 | Native save dialog appears for file location selection | Electron dialog.showSaveDialog API |
| FILE-03 | Default filename suggested (transcript-{timestamp}.txt) | dialog.defaultPath parameter |
| FILE-04 | File saved as .txt format with transcript content | fs.writeFile in main process |
| FILE-05 | User receives success feedback after save completes | Return success via IPC, show toast/UI feedback |
| FILE-06 | User receives error feedback if save fails | Error handling in IPC handler, return error to renderer |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Electron | 30.5.1 | Desktop framework | Already in use (package.json) |
| electron dialog API | Built-in | Native file dialogs | Standard Electron API |
| fs (Node.js) | Built-in | File system operations | Standard Node.js API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| path | Built-in | Path manipulation | For constructing default filename |
| LitElement | 2.7.4 | UI components | Already in use for ListenView |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dialog.showSaveDialog | Third-party dialog library | Not needed - Electron has built-in |
| Custom IPC | Already established pattern | Use existing bridge pattern |

**Installation:**
No additional packages needed - Electron, fs, and dialog are built-in.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── bridge/
│   └── fileBridge.js         # NEW: File operations IPC handler
├── preload.js                # MODIFY: Expose save-transcript API
└── ui/listen/
    └── ListenView.js         # MODIFY: Add Save button
```

### Pattern 1: IPC Handler for File Save
**What:** Main process handles file save with native dialog
**When to use:** When renderer needs to trigger native OS dialogs
**Example:**
```javascript
// In src/bridge/fileBridge.js
const { dialog, fs } = require('electron');
const path = require('path');

ipcMain.handle('file:save-transcript', async (event, { content, defaultFilename }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: defaultFilename,
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (canceled || !filePath) {
    return { success: false, error: 'Save canceled' };
  }

  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Pattern 2: Preload API Exposure
**What:** Expose file save API to renderer via contextBridge
**When to Use:** Renderer needs to trigger main process actions
**Example:**
```javascript
// In src/preload.js - add to listenView section
listenView: {
  // ... existing
  saveTranscript: (content) => ipcRenderer.invoke('file:save-transcript', {
    content,
    defaultFilename: `transcript-${new Date().toISOString().slice(0,16).replace(/[-:T]/g, '')}.txt`
  })
}
```

### Pattern 3: UI Button Handler
**What:** Handle button click in LitElement component
**When to Use:** User-initiated actions in UI
**Example:**
```javascript
// In ListenView.js
async handleSave() {
  const sttView = this.shadowRoot.querySelector('stt-view');
  const textToSave = sttView ? sttView.getTranscriptText() : '';

  if (!textToSave.trim()) {
    // Show error: nothing to save
    return;
  }

  const result = await window.api.listenView.saveTranscript(textToSave);
  if (result.success) {
    // Show success feedback
  } else {
    // Show error (unless canceled)
  }
}
```

### Anti-Patterns to Avoid
- **Writing files directly from renderer:** Never use Node.js fs in renderer - must go through IPC
- **Blocking the main process:** Use async/await for file operations
- **Not handling errors:** Always return meaningful error messages to renderer

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Native file dialog | Custom HTML dialog | dialog.showSaveDialog | Native feel, cross-platform |
| File path handling | Manual string manipulation | path.join, path.basename | Cross-platform path compatibility |
| Async file ops | Synchronous fs | fs.promises | Prevents UI blocking |

**Key insight:** Electron's dialog API provides native OS dialogs with zero extra dependencies.

## Common Pitfalls

### Pitfall 1: Renderer Process Accessing Node.js
**What goes wrong:** Code in renderer tries to use `require('fs')` directly
**Why it happens:** preload doesn't expose the API, or contextIsolation is off
**How to avoid:** Ensure API is exposed via contextBridge in preload.js
**Warning signs:** "require is not defined" errors in console

### Pitfall 2: Default Path Not Formatted Correctly
**What goes wrong:** Default filename doesn't match expected format
**Why it happens:** Incorrect date formatting or missing file extension
**How to avoid:** Use ISO format with replacements, add .txt extension
**Warning signs:** Filename shows as "transcript-2026-03-07T14:30:00.000Z" instead of "transcript-2026-03-07-1430.txt"

### Pitfall 3: Not Handling Save Cancellation
**What goes wrong:** App shows error when user cancels save dialog
**Why it happens:** Not checking canceled flag from dialog result
**How to avoid:** Check `result.canceled` before treating as error

### Pitfall 4: Large File Write Blocking UI
**What goes wrong:** App freezes when saving large transcripts
**Why it happens:** Using synchronous file operations
**How to avoid:** Use async fs.promises.writeFile

## Code Examples

Verified patterns from Electron documentation:

### Show Save Dialog
```javascript
// Source: Electron docs - https://www.electronjs.org/docs/latest/api/dialog
const { dialog } = require('electron');

const result = await dialog.showSaveDialog({
  title: 'Save Transcript',
  defaultPath: 'transcript-2026-03-07-1430.txt',
  filters: [
    { name: 'Text Files', extensions: ['txt'] }
  ]
});

// result.canceled - boolean
// result.filePath - string | undefined
```

### Write File Asynchronously
```javascript
// Source: Node.js docs
const fs = require('fs');

await fs.promises.writeFile('/path/to/file.txt', 'content', 'utf-8');
```

### Expose API via Context Bridge
```javascript
// Source: Electron docs - https://www.electronjs.org/docs/latest/api/context-bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listenView: {
    saveTranscript: (content) => ipcRenderer.invoke('file:save-transcript', content)
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Synchronous dialog.showSaveDialog | Async version | Electron 7+ | Non-blocking UI |
| renderer process fs access | IPC-based file ops | Electron 12+ (contextIsolation default) | Security improvement |

**Deprecated/outdated:**
- `dialog.showSaveDialogSync` - Use async version instead
- Node integration in renderer - Use contextBridge/preload instead

## Open Questions

1. **Empty transcript handling**
   - What we know: Should show error message per FILE-06
   - What's unclear: Exact error message wording
   - Recommendation: Use "No transcript content to save" as error

2. **File write encoding**
   - What we know: UTF-8 handles all text content
   - What's unclear: Any special characters that might need handling?
   - Recommendation: UTF-8 is safe default for .txt files

## Sources

### Primary (HIGH confidence)
- Electron dialog API - https://www.electronjs.org/docs/latest/api/dialog
- Electron contextBridge API - https://www.electronjs.org/docs/latest/api/context-bridge
- Node.js fs.promises - https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options

### Secondary (MEDIUM confidence)
- Existing codebase patterns verified in src/preload.js and src/bridge/featureBridge.js

### Tertiary (LOW confidence)
- None required - Electron APIs are well-documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using built-in Electron APIs already in project
- Architecture: HIGH - Following existing IPC patterns in codebase
- Pitfalls: HIGH - Common Electron patterns with clear solutions

**Research date:** 2026-03-07
**Valid until:** 30 days (stable API)
