# Architecture Research

**Domain:** Electron Desktop App - File Save Integration
**Researched:** 2026-03-07
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ ListenView │  │  SttView    │  │  Copy/Save Buttons  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┼─────────────────────┘              │
│                          │                                    │
│                    ┌─────▼─────┐                              │
│                    │  preload  │                              │
│                    │    api    │                              │
│                    └─────┬─────┘                              │
└──────────────────────────┼──────────────────────────────────┘
                           │ ipcRenderer.invoke()
┌──────────────────────────┼──────────────────────────────────┐
│                     Main Process                             │
├──────────────────────────┼──────────────────────────────────┤
│                    ┌─────▼─────┐                              │
│                    │featureBridge│  ← IPC handlers           │
│                    └─────┬─────┘                              │
│         ┌────────────────┼────────────────┐                  │
│   ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐           │
│   │  dialog   │    │    fs     │    │  Service  │           │
│   │(showSave)│    │(writeFile)│    │  Layer    │           │
│   └───────────┘    └───────────┘    └───────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `preload.js` | Exposes secure IPC bridge via contextBridge | Maps `ipcRenderer.invoke()` calls to named channels |
| `featureBridge.js` | Registers `ipcMain.handle()` handlers | Routes requests to appropriate services |
| `ListenView.js` | UI component with Copy/Save buttons | Gets transcript text, calls preload API |
| `SttView.js` | Manages transcript data | Stores `sttMessages` array, provides `getTranscriptText()` |
| `dialog` (Electron) | Native file save dialog | `dialog.showSaveDialog()` for file path |
| `fs` (Node) | File system operations | `fs.writeFile()` / `fs.writeFileSync()` for writing |

## Recommended Project Structure

```
src/
├── bridge/
│   └── featureBridge.js     # Add new IPC handler here
├── features/
│   └── listen/
│       └── listenService.js # Optional: file save logic could go here
├── ui/
│   └── listen/
│       └── ListenView.js    # Add Save button here
└── preload.js               # Add new API endpoint here
```

### Structure Rationale

- **featureBridge.js:** Natural place for IPC handlers - follows existing pattern for all feature operations
- **ListenView.js:** UI component that already has Copy button - adding Save button maintains consistency
- **preload.js:** Already exposes organized API namespaces per component - new `saveTranscript` method fits in `listenView` namespace

## Architectural Patterns

### Pattern 1: IPC Request-Response

**What:** Renderer invokes main process handler, waits for result
**When:** Any operation requiring main process privileges (file system, native dialogs)
**Trade-offs:** Secure (context isolation) but async/requires error handling

**Example:**
```javascript
// Renderer (ListenView.js)
const text = sttView.getTranscriptText();
const result = await window.api.listenView.saveTranscript(text);

// Preload (preload.js) - listensView namespace
saveTranscript: (text) => ipcRenderer.invoke('listen:saveTranscript', text)

// Main (featureBridge.js)
ipcMain.handle('listen:saveTranscript', async (event, text) => {
  // Use dialog.showSaveDialog() + fs.writeFile()
});
```

### Pattern 2: Native Dialog Pattern

**What:** Use Electron's dialog module for OS-native file picker
**When:** Need user to select file path/location
**Trade-offs:** Best UX but requires main process

**Example:**
```javascript
const { dialog } = require('electron');
const { writeFile } = require('fs/promises');

const result = await dialog.showSaveDialog({
  title: 'Save Transcript',
  defaultPath: 'transcript.txt',
  filters: [{ name: 'Text Files', extensions: ['txt'] }]
});

if (!result.canceled && result.filePath) {
  await writeFile(result.filePath, text, 'utf-8');
}
```

### Pattern 3: Service Handler Pattern

**What:** Feature services contain both business logic and IPC handler wrapper
**When:** Complex operations that warrant service abstraction
**Trade-offs:** Clean separation but more files

**Example (existing pattern):**
```javascript
// listenService.js
async handleSaveTranscript(text) {
  // Business logic here
}

// featureBridge.js
ipcMain.handle('listen:saveTranscript',
  async (event, text) => await listenService.handleSaveTranscript(text));
```

## Data Flow

### Save Transcript Flow

```
[User clicks Save]
    ↓
[ListenView.handleSave()] ──► [SttView.getTranscriptText()]
    ↓
[window.api.listenView.saveTranscript(text)]
    ↓
[preload.js]  ──────────► ipcRenderer.invoke('listen:saveTranscript', text)
    ↓
[featureBridge.js] ──────► ipcMain.handle('listen:saveTranscript')
    ↓
[dialog.showSaveDialog()] ──► User selects location
    ↓
[fs.writeFile()] ──────────► File written to disk
    ↓
[Result returned to renderer] ──► UI shows success/failure
```

### Key Data Flows

1. **Transcript Retrieval:** SttView.sttMessages (array) → getTranscriptText() → formatted string
2. **IPC Communication:** Renderer (preload api) → ipcRenderer.invoke → featureBridge → Service
3. **File Operation:** Main process receives text → shows dialog → writes file → returns result

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single handler fine, no optimization needed |
| 1k-100k users | Consider async file writes, non-blocking UI |
| 100k+ users | File I/O already isolated to main process - no changes needed |

### Scaling Priorities

1. **First bottleneck:** Large transcript files blocking UI - **Mitigation:** Already async via IPC
2. **Second bottleneck:** Disk I/O speed - **Mitigation:** User's local disk, not controllable

## Anti-Patterns

### Anti-Pattern 1: Direct File System Access from Renderer

**What people do:** Try to use Node.js `fs` directly in renderer process
**Why it's wrong:** Renderer runs in sandboxed web context, no direct Node access
**Do this instead:** Use IPC to invoke main process file operations

### Anti-Pattern 2: Blocking Dialogs

**What people do:** Use synchronous dialog APIs that block the event loop
**Why it's wrong:** Freezes UI, poor user experience
**Do this instead:** Use async `dialog.showSaveDialog()` with await

### Anti-Pattern 3: Skipping Error Handling

**What people do:** Assume file save always succeeds
**Why it's wrong:** Disk full, permissions denied, user cancels - all common failure modes
**Do this instead:** Always check dialog result.canceled and wrap writeFile in try-catch

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Electron dialog | Import in main process | `const { dialog } = require('electron')` |
| Node fs | Import in main process | `const fs = require('fs')` or `const { writeFile } = require('fs/promises')` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Renderer ↔ Main | IPC via preload | Uses contextBridge for security |
| featureBridge ↔ Service | Direct function call | Services are plain JS modules |

## Implementation Build Order

Based on existing architecture patterns, recommended implementation order:

1. **Add IPC handler in featureBridge.js** - Register `listen:saveTranscript` handler
2. **Add preload API in preload.js** - Expose `listenView.saveTranscript()` to renderer
3. **Add Save button in ListenView.js** - Similar to Copy button, call preload API
4. **Handle response in ListenView** - Show success/error feedback to user

### Dependencies

- **Phase 1:** featureBridge.js handler (no dependencies)
- **Phase 2:** preload.js API (depends on handler existing)
- **Phase 3:** ListenView button (depends on preload API)
- **Phase 4:** Error handling UI (depends on button)

## Sources

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/api/ipc-main)
- [Electron dialog.showSaveDialog](https://www.electronjs.org/docs/latest/api/dialog)
- [Electron contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- Context7: electron - IPC patterns

---
*Architecture research for: Save Transcript to File Feature*
*Researched: 2026-03-07*
