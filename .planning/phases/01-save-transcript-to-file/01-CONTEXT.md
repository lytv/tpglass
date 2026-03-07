# Phase 1: Save Transcript to File - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can export their speech-to-text transcripts from Listen sessions to local .txt files via a Save button in the desktop app UI. This includes the IPC handler, preload API, and UI button with native save dialog.

</domain>

<decisions>
## Implementation Decisions

### Default filename
- Format: `transcript-{YYYY-MM-DD-HHMM}.txt`
- Includes "transcript" prefix for clarity
- ISO-like timestamp: YYYY-MM-DD-HHMM (e.g., transcript-2026-03-07-1430.txt)
- Just timestamp, no session name inclusion
- .txt extension added automatically by dialog

### Button placement
- Follows existing Copy button pattern in ListenView
- Near the Copy button for consistency

### Feedback pattern
- Standard success/error handling as per existing codebase patterns

### Claude's Discretion
- Exact button styling (matching Copy or distinct)
- Error message content
- Empty transcript handling

</decisions>

<specifics>
## Specific Ideas

No specific references mentioned — standard approach using existing Copy button as template.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-save-transcript-to-file*
*Context gathered: 2026-03-07*
