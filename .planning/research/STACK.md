# Stack Research

**Domain:** Electron Desktop App File Save Functionality
**Researched:** 2026-03-07
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Electron dialog.showSaveDialog | Built-in (v28+) | Native save dialog for file location selection | Standard Electron API, provides OS-native UX, no additional dependencies |
| Node.js fs module (fs.promises) | Built-in with Electron | Asynchronous file writing | Part of Electron's Node.js integration, reliable, well-tested |
| IPC (ipcMain.handle / ipcRenderer.invoke) | Electron built-in | Main-renderer communication | Already established pattern in this codebase |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Electron's built-in APIs are sufficient for .txt file saving |

### Implementation Pattern

The Save Transcript feature uses the same IPC pattern already established in the codebase:

1. **Main Process (featureBridge.js):**
   ```javascript
   const { dialog, fs } = require('electron');
   const path = require('path');

   ipcMain.handle('transcript:saveToFile', async (event, { content, defaultName }) => {
     const { filePath, canceled } = await dialog.showSaveDialog({
       title: 'Save Transcript',
       defaultPath: defaultName || 'transcript.txt',
       filters: [
         { name: 'Text Files', extensions: ['txt'] },
         { name: 'All Files', extensions: ['*'] }
       ]
     });

     if (canceled || !filePath) {
       return { success: false, canceled: true };
     }

     try {
       await fs.promises.writeFile(filePath, content, 'utf-8');
       return { success: true, filePath };
     } catch (error) {
       console.error('Failed to save file:', error);
       return { success: false, error: error.message };
     }
   });
   ```

2. **Preload (preload.js):**
   ```javascript
   listenView: {
     saveTranscriptToFile: (content, defaultName) =>
       ipcRenderer.invoke('transcript:saveToFile', { content, defaultName }),
   }
   ```

3. **Renderer (ListenView.js):**
   ```javascript
   async handleSave() {
     const sttView = this.shadowRoot.querySelector('stt-view');
     const textToSave = sttView ? sttView.getTranscriptText() : '';

     const result = await window.api.listenView.saveTranscriptToFile(
       textToSave,
       `transcript-${Date.now()}.txt`
     );

     if (result.success) {
       console.log('Transcript saved to:', result.filePath);
     }
   }
   ```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| dialog.showSaveDialog | renderer-side File System Access API | Only if targeting Chromium 86+ and no Electron main process needed |
| fs.promises.writeFile | electron-store (for small data) | electron-store is for app settings, not user file exports |
| IPC pattern | contextBridge with send/on | Use send/on for fire-and-forget; invoke/handle for request-response |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Writing files directly from renderer | Security risk - breaks Electron sandbox model | IPC to main process with dialog |
| Third-party file dialog libraries | Unnecessary when Electron has built-in dialog.showSaveDialog | Built-in dialog API |
| Synchronous fs.writeFileSync | Blocks event loop, poor UX for large files | fs.promises.writeFile (async) |

## Stack Patterns by Variant

**If saving large transcripts (>10MB):**
- Use streaming write with createWriteStream
- Add progress indicator in UI

**If adding future export formats (PDF, DOCX):**
- Consider file-saver npm package for renderer-side downloads
- But keep main process dialog for native UX

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| dialog.showSaveDialog | Electron 7+ | Current codebase uses Electron 28+ |
| fs.promises | Node.js 10+ | Electron bundles modern Node.js |
| ipcMain.handle | Electron 8+ | Stable since early Electron versions |

## Installation

No additional packages required. The implementation uses:
- Electron's built-in `dialog` module (main process)
- Node.js built-in `fs` and `path` modules
- Existing IPC infrastructure in the codebase

## Sources

- Context7: `/electron/electron` — `dialog.showSaveDialog` API documentation
- Context7: `/electron/electron` — File system operations with `fs.promises.writeFile`
- Project code: `src/bridge/featureBridge.js` — Existing IPC handler pattern
- Project code: `src/preload.js` — Existing contextBridge API exposure pattern

---
*Stack research for: Save Transcript to File feature*
*Researched: 2026-03-07*
