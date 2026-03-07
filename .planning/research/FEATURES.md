# Feature Research

**Domain:** Desktop App Save/Export Text Content
**Researched:** 2026-03-07
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Native save dialog | Standard OS UX, ensures valid file path | LOW | Electron's `dialog.showSaveDialog()` provides native macOS/Windows dialogs |
| File type filter (.txt default) | Users expect to select file type | LOW | Use `filters` option: `[{ name: 'Text Files', extensions: ['txt'] }]` |
| Default filename suggestion | Reduces friction, helps user identify content | LOW | Use `defaultPath` option, e.g., `transcript-2026-03-07.txt` |
| Success feedback | Confirms action completed | LOW | Show brief "Saved!" state, similar to Copy button's 'copied' state |
| Error handling | Users need to know if save failed | LOW | Show error message with reason, allow retry |
| Keyboard shortcut | Power users expect Cmd+S / Ctrl+S | LOW | Add save shortcut mapped to same action |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multiple export formats | Flexibility for different use cases | MEDIUM | Add .md (Markdown) export - preserves formatting, popular for notes apps |
| Auto-generated filename | One-click export without dialog | LOW | Use timestamp + session title for filename, bypass dialog with `defaultPath` |
| Export to Downloads folder | Quickest path to saved file | LOW | Remember last location or default to Downloads |
| Copy path to clipboard | Easy to find saved file later | LOW | After save, optionally copy file path |
| Quick export (no dialog) | Speed for repeated saves | LOW | Default to last-used location |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-save to file | "Don't make me click" | Creates file management issues, may save incomplete transcripts | Keep in-memory, let user explicitly save when ready |
| PDF export | Professional look | Requires additional libraries, complex formatting | Offer .md export which can be converted |
| Cloud storage export | Access anywhere | Adds auth complexity, sync issues, out of scope for v1 | Focus on local file export first |
| Multiple file selection | "Save all sessions" | UI complexity, not requested | Defer to future if users ask |

## Feature Dependencies

```
[Save Button UI]
    └──requires──> [IPC Handler in Main Process]
                       └──requires──> [Electron dialog.showSaveDialog]
                                      └──requires──> [fs.writeFile]

[Default Filename Generation]
    └──requires──> [Transcript Text Access]
                       └──requires──> [SttView.getTranscriptText()]

[Keyboard Shortcut]
    └──requires──> [Save Button Logic]
```

### Dependency Notes

- **Save button requires IPC handler:** Must add `ipcMain.handle()` in main process to show dialog and write file
- **Default filename enhances UX:** Generate from session date/time, requires access to session metadata
- **Keyboard shortcut requires save logic:** Shortcut should trigger same flow as button click

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Native save dialog** — Use Electron's `dialog.showSaveDialog()` with `.txt` filter
- [ ] **Default filename** — Generate from session timestamp, e.g., `transcript-2026-03-07-1430.txt`
- [ ] **Save button in UI** — Add to Listen view, similar placement to Copy button
- [ ] **Success/error feedback** — Visual feedback after save completes
- [ ] **Transcript text extraction** — Reuse existing `SttView.getTranscriptText()` method

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Keyboard shortcut (Cmd+S)** — Power user expectation, quick iteration
- [ ] **Markdown export (.md)** — Popular format for notes apps, preserves structure
- [ ] **Remember last save location** — electron-store preference, faster repeat saves

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **PDF export** — Requires additional libraries, complex formatting
- [ ] **Batch export (all sessions)** — Only if users request it
- [ ] **Cloud storage integration** — Out of scope for v1
- [ ] **Auto-save** — Creates file management complexity

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Native save dialog | HIGH | LOW | P1 |
| Save button in UI | HIGH | LOW | P1 |
| Default filename | MEDIUM | LOW | P1 |
| Success/error feedback | MEDIUM | LOW | P1 |
| Keyboard shortcut (Cmd+S) | MEDIUM | LOW | P2 |
| Markdown export | MEDIUM | MEDIUM | P2 |
| Remember last location | LOW | LOW | P2 |
| PDF export | LOW | HIGH | P3 |
| Cloud export | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Otter.ai | Descript | Our Approach |
|---------|----------|----------|--------------|
| Export to .txt | Yes | Yes | Yes - v1 core feature |
| Export to .md | No | Yes | Add in v1.x - differentiates |
| Export to PDF | Yes | Yes | Defer to v2+ - high complexity |
| Custom filename | Yes | Yes | Yes - default with timestamp |
| Auto-save | Yes | Yes | Deliberately NOT for v1 - complexity |
| Keyboard shortcut | Limited | Yes | Add in v1.x - user expectation |

**Analysis approach:** Based on web research of competitor export features and UX Stack Exchange discussions on save vs. export conventions.

## Implementation Notes

### Technical Pattern (from codebase)

The existing Copy button (`ListenView.handleCopy()`) uses:
1. Get transcript text via `sttView.getTranscriptText()`
2. Use `navigator.clipboard.writeText()` for clipboard

Save to file should follow similar pattern:
1. Get transcript text via `sttView.getTranscriptText()`
2. Send to main process via IPC (`ipcRenderer.invoke()`)
3. Main process shows dialog via `dialog.showSaveDialog()`
4. Main process writes file via `fs.writeFile()`

### Electron API Reference

```javascript
// Main process (src/index.js or new handler)
const { dialog } = require('electron');
const fs = require('fs');

ipcMain.handle('save-transcript', async (event, text) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Transcript',
    defaultPath: `transcript-${new Date().toISOString().slice(0,10)}.txt`,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] }
    ]
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    fs.writeFileSync(filePath, text, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

## Sources

- [Electron Dialog API Documentation](https://www.electronjs.org/docs/latest/api/dialog) - Official Electron docs for showSaveDialog
- [UX Stack Exchange: Save vs Export](https://ux.stackexchange.com/questions/72779/distinction-between-saving-and-exporting) - Save creates same format, export creates different format
- [Electron Best Practices - Medium](https://medium.com/redblacktree/essential-desktop-application-attributes-in-electron-2118352cc3d5) - Essential desktop app patterns
- Competitor analysis: Otter.ai, Descript export features (from web research)

---
*Feature research for: Save Transcript to File*
*Researched: 2026-03-07*
