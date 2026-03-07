# Phase 3: Settings UI - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Add translation preferences to the existing SettingsView sidebar panel. Users can toggle translation on/off and select target language. This phase adds the UI controls; integration with translation service comes in Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Toggle style
- Use a switch toggle (iOS-style), not checkbox
- Modern, clean look matching the existing SettingsView aesthetic

### Language selector
- Searchable dropdown with search input
- Shows 20+ common languages
- Users can type to filter

### Claude's Discretion
- Toggle placement within settings panel (top/middle/bottom)
- Exact default values for translation enabled (off) and default language (English)
- Persistence key naming and structure in electron-store

</decisions>

<specifics>
## Specific Ideas

- Add to existing SettingsView.js sidebar panel
- Follow existing 240px width, LitElement component patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-settings-ui*
*Context gathered: 2026-03-07*
