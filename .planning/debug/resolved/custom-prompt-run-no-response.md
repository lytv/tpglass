---
status: resolved
trigger: "custom-prompt-run-no-response"
created: 2026-03-12T00:00:00.000Z
updated: 2026-03-12T00:00:00.000Z
---

## ROOT CAUSE FOUND

**Debug Session:** .planning/debug/custom-prompt-run-no-response.md

**Root Cause:** Type mismatch between selectedPromptId (string from HTML dropdown) and prompt.id (number from SQLite). The strict equality (===) in getPromptById fails, causing getPromptById to return undefined, and _handleRunCustomPrompt returns early without setting any error.

**Evidence Summary:**
- HTML dropdown returns string value (e.g., "1")
- SQLite returns numeric id (e.g., 1)
- getPromptById uses strict equality (===) which fails type comparison
- _handleRunCustomPrompt silently returns when prompt is undefined

**Files Involved:**
- /Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js: getPromptById uses strict equality causing type mismatch

**Fix Applied:** Changed getPromptById to use loose equality (==) instead of strict equality (===) to allow string-to-number comparison.

---

## Current Focus
hypothesis: Type mismatch between string (from dropdown value) and number (from SQLite id)
test: Compare selectedPromptId type vs preset.id type
expecting: String "1" !== Number 1 causes getPromptById to return undefined
next_action: Apply fix using loose equality or type conversion

## Symptoms
expected: Click "Run Prompt" button -> see result (or error message) displayed in modal
actual: Nothing happens - no result, no error, no loading state changes
errors: No specific error in console for custom prompt
reproduction: 1. Click button to open custom prompt modal 2. Select a prompt from dropdown 3. Click "Run Prompt" button
started: After phase 05.3.1 was implemented

## Eliminated
- hypothesis: API not being called - evidence: window.api.customPrompt exists and is called
- hypothesis: Transcript text empty - evidence: expandedTranslation is checked before proceeding
- hypothesis: Error in summarizeService - evidence: Function completes but returns early due to missing prompt

## Evidence
- timestamp: 2026-03-12
  checked: SttView.js _handleSelectPrompt (line 700)
  found: e.target.value returns string from HTML select dropdown
  implication: selectedPromptId is always a string

- timestamp: 2026-03-12
  checked: SttView.js getPromptById (line 660)
  found: Uses strict equality (===) to compare p.id === id
  implication: Comparison fails when types differ

- timestamp: 2026-03-12
  checked: SQLite repository (sqlite.repository.js line 12)
  found: db.prepare(query).all(uid) returns id as JavaScript number
  implication: preset.id is a number, but selectedPromptId is a string

- timestamp: 2026-03-12
  checked: SttView.js _handleRunCustomPrompt (lines 666-667)
  found: const prompt = this.getPromptById(this.selectedPromptId); if (!prompt) return;
  implication: Function silently returns early without any error when prompt is undefined

## Resolution
root_cause: Type mismatch between selectedPromptId (string from HTML dropdown) and prompt.id (number from SQLite). The strict equality (===) in getPromptById fails, causing getPromptById to return undefined, and _handleRunCustomPrompt returns early without setting any error.
fix: Changed getPromptById to use loose equality (==) instead of strict equality (===)
verification: User confirmed fix works - "confirmed fixed"
files_changed:
  - /Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js (line 661: getPromptById uses == instead of ===)
