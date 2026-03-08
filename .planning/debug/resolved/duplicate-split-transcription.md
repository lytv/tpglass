---
status: resolved
trigger: "duplicate and split transcription issue with Deepgram"
created: 2026-03-08T00:00:00Z
updated: 2026-03-08T00:00:00Z
---

## Current Focus
hypothesis: "findLastPartialIdx only finds partial messages, so when final transcription arrives after debounce or without a partial, it creates duplicate instead of merging"
test: "Read SttView.js to understand flow and verify issue exists"
expecting: "Code shows partial messages are handled separately from final, causing duplicates"
next_action: "FIXED - User confirmed working"

## Symptoms
expected: "Single entry per continuous speech segment - 'Hello World' should appear as one entry"
actual: "1) Duplicate: Same content appears twice. 2) Split: Content split into multiple entries"
errors: ""
reproduction: "When speaking continuously, transcription appears as duplicates or split entries"
started: "Current issue"

## Eliminated

## Evidence
- timestamp: "2026-03-08"
  checked: "SttView.js lines 178-223"
  found: "findLastPartialIdx function only finds messages where m.isPartial === true"
  implication: "When final transcription arrives and there's no partial message (e.g., short utterance, debounce timing), it creates new message instead of updating existing"
- timestamp: "2026-03-08"
  checked: "sttService.js debounce flow"
  found: "For Gemini/Deepgram: debounceMyCompletion triggers flushMyCompletion which sends isFinal=true. This can fire after partial was already converted to final."
  implication: "If previous final wasn't found (due to findLastPartialIdx bug), creates duplicate entry"

## Resolution
root_cause: "findLastPartialIdx only searches for partial messages (isPartial=true), not final ones. When final transcription arrives and there's no partial to update, creates a new duplicate entry."
fix: "Changed findLastPartialIdx to findLastMessageIdx - find ANY message (partial OR final) for speaker. Added merge logic: when receiving isFinal, merge text with existing message instead of creating duplicate entry."
verification: "Self-verified: Code now finds any message (partial or final), and merges final transcription into existing message. Human verified: User confirmed fix works."
files_changed:
  - "src/ui/listen/stt/SttView.js:172-230"
