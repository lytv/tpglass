# Phase 4: Display Integration - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view and interact with translated transcripts in Listen view. This includes displaying translated text, toggling between original/translated, showing loading states, and error handling.

</domain>

<decisions>
## Implementation Decisions

### Layout & positioning
- Side-by-side layout: original text on left, translated on right
- On mobile: stacks vertically (original on top, translated below)
- Visual divider line between original and translated panels

### Toggle interaction
- Toggle switch control for toggling between original and translated
- Global header toggle at top of Listen view (affects all transcripts)
- Translation icon as toggle label
- Default state: off by default (shows original text)

### Loading state
- Spinner centered in translated panel while loading
- Uses app theme color (matches other spinners)
- Instant switch when translation completes (no fade transition)

</decisions>

<specifics>
## Specific Ideas

- "Original left / Translated right" - familiar reading direction (LTR)
- Vertical stack on mobile for readability
- Divider line provides clear visual separation between panels
- Global toggle means user enables once for entire Listen view

</specifics>

<deferred>
## Deferred Ideas

- Per-card toggle for individual control - future enhancement
- Side-by-side on mobile with horizontal scroll - deferred to v2
- Fade transition - not needed for v1

</deferred>

---

*Phase: 04-display-integration*
*Context gathered: 2026-03-07*
