# Pitfalls Research

**Domain:** Electron File Save - Save Transcript to File Feature
**Researched:** 2026-03-07
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Renderer Cannot Access File System (contextIsolation Blocks fs)

**What goes wrong:**
The Save Transcript feature fails silently or throws errors because the renderer process cannot access Node.js `fs` module. With `contextIsolation: true` (default since Electron 12), direct `require('fs')` calls in the renderer are blocked.

**Why it happens:**
PickleGlass uses `contextIsolation: true` and `nodeIntegration: false` (as seen in ARCHITECTURE.md and preload.js). The existing Copy functionality uses `navigator.clipboard.writeText()` which works in the renderer. However, file save requires the main process because there's no browser-native file save API.

**How to avoid:**
- Add new IPC handler in `featureBridge.js` that calls `dialog.showSaveDialog()` in main process
- Expose new API via preload.js using `ipcRenderer.invoke()`
- Call the IPC handler from the renderer (like ListenView.handleCopy() does)

**Warning signs:**
- "require is not defined" in console
- "fs module not found" errors
- Feature works in development with `nodeIntegration: true` but fails in production

**Phase to address:**
Phase implementing the IPC handler and preload API

---

### Pitfall 2: Not Handling Dialog Cancellation

**What goes wrong:**
After clicking "Save", if the user cancels the dialog, the code attempts to write to an undefined file path, causing errors or empty files.

**Why it happens:**
`dialog.showSaveDialog()` returns `{ canceled: boolean, filePath: string | undefined }`. Many implementations forget to check `canceled` before proceeding.

**How to avoid:**
Always check both conditions:
```javascript
const { filePath, canceled } = await dialog.showSaveDialog(win, options);
if (canceled || !filePath) {
  return { success: false, canceled: true };
}
await fs.promises.writeFile(filePath, content);
```

**Warning signs:**
- Code only checks `if (filePath)` without checking `canceled`
- User reports "Save does nothing" when canceling

**Phase to address:**
Phase implementing the save dialog handler

---

### Pitfall 3: Race Condition - Window Destroyed While Dialog Open

**What goes wrong:**
If the user closes the Listen window while the save dialog is open, the IPC handler tries to use a destroyed BrowserWindow reference, causing crashes.

**Why it happens:**
IPC handlers receive the event but don't check if the sending window still exists. The parent window reference becomes invalid.

**How to avoid:**
In the IPC handler, verify window is still valid:
```javascript
ipcMain.handle('transcript:save', async (event, { content }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) {
    return { success: false, error: 'Window closed' };
  }
  const { filePath, canceled } = await dialog.showSaveDialog(win, { ... });
  // ... rest of handler
});
```

**Warning signs:**
- App crashes when closing window during file dialog
- "Cannot read property of null" errors

**Phase to address:**
Phase implementing the save IPC handler

---

### Pitfall 4: Not Handling File Write Errors

**What goes wrong:**
File write fails silently (disk full, permission denied, invalid path) with no user feedback. User thinks save succeeded.

**Why it happens:**
`fs.promises.writeFile()` can fail for many reasons but implementations often don't wrap in try/catch or return error status to renderer.

**How to avoid:**
Wrap file operations in try/catch and return error status:
```javascript
try {
  await fs.promises.writeFile(filePath, content);
  return { success: true, filePath };
} catch (error) {
  console.error('File write failed:', error);
  return { success: false, error: error.message };
}
```

**Warning signs:**
- No error handling around `fs.writeFile`
- User reports "save doesn't work" but no error shown

**Phase to address:**
Phase implementing the file write logic

---

### Pitfall 5: Missing Default File Extension

**What goes wrong:**
User saves "my_transcript" without extension, then can't open the file because it's named "my_transcript" (no .txt).

**Why it happens:**
`dialog.showSaveDialog()` does not automatically add extensions. The `filters` option only limits what the user can select, not what gets added automatically.

**How to avoid:**
Either:
1. Set `defaultPath` with extension: `defaultPath: 'transcript.txt'`
2. Post-process to add extension if missing
3. Use `properties: ['showOverwriteConfirmation']` to warn on overwrite

**Warning signs:**
- Users saving files without .txt extension
- "I saved but can't find my file" complaints

**Phase to address:**
Phase implementing the save dialog options

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip IPC and write from renderer with nodeIntegration | Simpler code, faster to implement | Security vulnerability, breaks in production | Never - security risk |
| Use synchronous dialog.showSaveDialogSync | Avoid async complexity | Blocks UI, poor UX | Only for critical error scenarios |
| Skip error handling for "simple" write | Faster to write | Silent failures, poor UX | Never |
| Hardcode file path instead of dialog | No dialog to manage | Overwrites files, poor UX | Never for user-facing feature |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| dialog.showSaveDialog | Not passing parent window | Pass BrowserWindow reference so dialog is modal |
| IPC handler | Not returning success/failure | Always return status so renderer can notify user |
| preload.js | Adding new APIs without documentation | Follow existing pattern: `api.transcript: { save: ... }` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire transcript into memory | High memory during save | Stream write for large content | Transcripts > 10MB |
| Blocking main process with sync write | UI freezes | Use async `fs.promises.writeFile` | Always - use async |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting full file path from renderer | Path traversal attack | Use dialog.showSaveDialog which returns sanitized path |
| Using nodeIntegration in renderer | Code injection vulnerability | Keep contextIsolation: true, use IPC |
| No validation of content | Buffer overflow with malicious content | Validate content is string before writing |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No success feedback | User unsure if save worked | Show toast/notification on success |
| No error message on failure | User doesn't know what went wrong | Display error in UI with retry option |
| Save dialog opens behind window | User misses dialog, thinks it's broken | Always pass parent window to dialog |
| Default filename not meaningful | User has to rename | Use session name or timestamp in defaultPath |

---

## "Looks Done But Isn't" Checklist

- [ ] **Feature:** Save Transcript - IPC handler created but missing window validity check
- [ ] **Feature:** Save Transcript - Dialog cancellation not handled properly
- [ ] **Feature:** Save Transcript - No error feedback to user when save fails
- [ ] **Feature:** Save Transcript - File extension not added to default path
- [ ] **Feature:** Save Transcript - Large transcript (10MB+) may cause memory issues

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing IPC handler | LOW | Add handler to featureBridge.js and preload.js |
| Not handling cancellation | LOW | Add `if (canceled) return` check |
| Window race condition | MEDIUM | Add `win.isDestroyed()` check in handler |
| Silent write failure | MEDIUM | Add try/catch and return error to renderer |
| Missing extension | HIGH | Update defaultPath to include .txt |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Renderer cannot access fs | Phase adding IPC handler | Test with contextIsolation: true |
| Dialog cancellation not handled | Phase implementing save dialog | Test cancel flow manually |
| Window race condition | Phase implementing IPC handler | Close window during dialog |
| File write errors not handled | Phase implementing file write | Test with full disk, permission denied |
| Missing file extension | Phase configuring dialog options | Save without typing extension |
| No user feedback | Phase adding UI feedback | Verify success/error states |

---

## Sources

- [Electron dialog.showSaveDialog API](https://github.com/electron/electron/blob/main/docs/api/dialog.md) - Official documentation
- [Electron Context Isolation](https://github.com/electron/electron/blob/main/docs/tutorial/context-isolation.md) - Security best practices
- [Electron IPC Pattern](https://github.com/electron/electron/blob/main/docs/tutorial/ipc.md) - Main process communication
- [Electron Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) - contextIsolation default
- Project codebase analysis: featureBridge.js pattern, preload.js API exposure, ListenView.handleCopy()

---

*Pitfalls research for: Save Transcript to File Feature*
*Researched: 2026-03-07*
