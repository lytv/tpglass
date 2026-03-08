---
phase: quick
plan: "1"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/bridge/featureBridge.js
  - src/preload.js
  - src/ui/listen/ListenView.js
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "User's last save directory is remembered between sessions"
    - "Auto-save triggers when user stops a recording session"
    - "Saved transcript appears in the remembered directory"
  artifacts:
    - path: "src/bridge/featureBridge.js"
      provides: "IPC handler for file save with path memory"
      contains: "file:save-transcript, getLastSavePath, setLastSavePath"
    - path: "src/preload.js"
      provides: "API for save transcript and path management"
      contains: "listenView.saveTranscript, getLastSavePath, setLastSavePath"
    - path: "src/ui/listen/ListenView.js"
      provides: "Auto-save trigger on session stop"
      contains: "handleListenStop, autoSaveTranscript"
  key_links:
    - from: "ListenView.js"
      to: "preload.js"
      via: "window.api.listenView.saveTranscript"
      pattern: "auto-save on stop"
    - from: "preload.js"
      to: "featureBridge.js"
      via: "ipcRenderer.invoke"
      pattern: "file:save-transcript with path"
---

<objective>
Add auto-save transcription with remembered file path functionality.

Purpose: Improve user experience by automatically saving transcripts when recording stops, and remembering the last used directory so users don't have to navigate to it each time.

Output: Modified save workflow that remembers path and auto-saves on session stop.
</objective>

<execution_context>
@/Users/mac/tools/tpglass/.planning/execute-plan.md
</execution_context>

<context>
@/Users/mac/tools/tpglass/src/bridge/featureBridge.js (lines 128-155 for save IPC)
@/Users/mac/tools/tpglass/src/preload.js (lines 179-183 for save API)
@/Users/mac/tools/tpglass/src/ui/listen/ListenView.js (lines 652-701 for save handler)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add path memory to save IPC handler</name>
  <files>src/bridge/featureBridge.js</files>
  <action>
    1. Import electron-store at top of file if not already imported (const Store = require('electron-store');)
    2. Create a store instance for saving settings: const settingsStore = new Store({ name: 'settings' });
    3. Modify the 'file:save-transcript' handler to:
       - Get lastSavePath from store (default to user's Documents folder if not set)
       - Use lastSavePath as defaultPath in showSaveDialog
       - After successful save, store the directory (not full file path) back to store
       - Add new handlers: 'file:get-last-save-path' and 'file:set-last-save-path'
    4. Export getLastSavePath and setLastSavePath functions
  </action>
  <verify>
    <automated>Grep in featureBridge.js for "lastSavePath" and verify store usage</automated>
  </verify>
  <done>Save dialog opens at last used directory, path is persisted between app restarts</done>
</task>

<task type="auto">
  <name>Task 2: Expose path management APIs in preload</name>
  <files>src/preload.js</files>
  <action>
    1. Add getLastSavePath API: return ipcRenderer.invoke('file:get-last-save-path')
    2. Add setLastSavePath API: return ipcRenderer.invoke('file:set-last-save-path', { path })
    3. Modify existing saveTranscript to optionally accept lastSavePath from settings and pass it to IPC
  </action>
  <verify>
    <automated>Grep in preload.js for "getLastSavePath, setLastSavePath"</automated>
  </verify>
  <done>Preload exposes path management APIs accessible from renderer</done>
</task>

<task type="auto">
  <name>Task 3: Add auto-save on session stop</name>
  <files>src/ui/listen/ListenView.js</files>
  <action>
    1. Find the handleListenStop or session stop handler in ListenView.js
    2. Add autoSaveTranscript method that:
       - Gets transcript text (same logic as handleSave)
       - Calls window.api.listenView.saveTranscript with auto-save flag
    3. Trigger autoSaveTranscript when session stops (listen:stop event or handleListenRequest change)
    4. Add setting to enable/disable auto-save (optional - check if user wants toggle)
  </action>
  <verify>
    <automated>Grep in ListenView.js for "autoSaveTranscript" and verify call on session stop</automated>
  </verify>
  <done>Transcript automatically saves when user stops recording session</done>
</task>

</tasks>

<verification>
- Save dialog remembers last directory across app restarts
- Auto-save triggers when recording session stops
- Works with default filename format
</verification>

<success_criteria>
- User can save transcript manually with path memory
- Last save directory is persisted between app sessions
- Auto-save triggers on session stop without user interaction
</success_criteria>

<output>
After completion, create .planning/quick/1-add-auto-save-transcription-with-remembe/1-SUMMARY.md
</output>
