---
status: verifying
trigger: "Fix Select All button: 1) Text → Icon only (☐/☑), 2) Position: move from transcription-container to header row"
created: 2026-03-12T00:00:00.000Z
updated: 2026-03-12T00:00:00.000Z
---

## Current Focus
hypothesis: "Need to modify render() method to add a header row above transcription-container and move Select All button there with icon instead of text"
test: "Read SttView.js and find the button implementation"
expecting: "Find where button is rendered and its current styling"
next_action: "Verify fix by reviewing changes made to CSS and render method"

## Symptoms
expected: "Button shows only ☐/☑ icon, no text; Located in header row above transcript list, visible without hover"
actual: "Button shows 'Select All' / 'Deselect All' text; Located inside transcription-container at top of message list, only visible on hover"
errors: []
reproduction: "Open SttView.js in src/ui/listen/stt/"
started: "Always broken"

## Eliminated

## Evidence
- timestamp: "2026-03-12"
  checked: "SttView.js render() method (lines 1139-1358)"
  found: "Select All button at lines 1148-1152, inside transcription-container, only visible on hover (isHoveringList)"
  implication: "Button needs to move outside transcription-container to a header row"

- timestamp: "2026-03-12"
  checked: "CSS styles (lines 369-388)"
  found: "select-all-btn has opacity:0 by default, opacity:1 on transcription-container:hover"
  implication: "Need new header-row styles for always-visible button"

- timestamp: "2026-03-12"
  checked: "Button text logic (line 1150)"
  found: "Ternary shows 'Deselect All' or 'Select All' text"
  implication: "Change to show ☐ or ☑ icon instead"

## Resolution
root_cause: "Button rendered inside transcription-container with hover-only visibility and text labels"
fix: "1) Added .transcript-header CSS class above transcription-container, 2) Moved button to header-row with icon (☐/☑), 3) Button now always visible (no opacity:0), 4) Added title attribute for accessibility"
verification: "Need user to verify in browser"
files_changed:
  - "src/ui/listen/stt/SttView.js"
