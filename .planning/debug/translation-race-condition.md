---
status: resolved
trigger: "Implement fixes for transcription translation intermittent issue: race condition in settings loading"
created: 2026-03-08T00:00:00.000Z
updated: 2026-03-08T00:00:00.000Z
---

## Current Focus
hypothesis: "Implementing fixes: Add translationSettingsLoaded flag, re-trigger translations when settings load, add error handling"
test: "Apply code changes to ListenView.js and SttView.js"
expecting: "Translation will work reliably when toggled, with proper error handling"
next_action: "Verified - commit complete"

## Symptoms
expected: "Translation should work immediately when toggled, with or without API key configured (shows error if missing)"
actual: "Translation works sometimes - race condition causes it to miss initial transcriptions"
reproduction: "Start recording, toggle translation immediately - translations don't appear"
started: "This has been an intermittent issue"

## Root Causes Identified

### 1. Race Condition in ListenView (PRIMARY ISSUE)
- `loadTranslationSettings()` called in `connectedCallback()`
- Component renders BEFORE async settings load completes
- `translationEnabled` defaults to `false` initially
- Even when settings load later, translations already missed

### 2. Missing API Key Handling
- If API key not configured, silently returns original text
- No user feedback

### 3. Toggle Button State Issue
- If `!translationEnabled`, toggle silently returns
- Should disable button visually

## Resolution
root_cause: "Race condition: translationSettings loads async in connectedCallback but component renders before it completes, causing translations to be missed"
fix: "1) Added translationSettingsLoaded flag to track when settings load, 2) Pass to SttView, 3) Re-trigger translations when settings load completes, 4) Show disabled button with feedback when translation not enabled"
verification: "Code review - all three fixes implemented"
files_changed:
  - "src/ui/listen/ListenView.js: Added translationSettingsLoaded property, initialization, set after load, passed to SttView, disabled button styling, user feedback toast"
  - "src/ui/listen/stt/SttView.js: Added translationSettingsLoaded property, trigger translations when settings load"
