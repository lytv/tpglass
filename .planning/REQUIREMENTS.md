# Requirements: PickleGlass - Save Transcript Feature

**Defined:** 2026-03-07
**Core Value:** Users can export their speech-to-text transcripts from Listen sessions to local .txt files, enabling offline access and sharing.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### File Export

- [ ] **FILE-01**: User can click Save button in Listen view to save transcript
- [ ] **FILE-02**: Native save dialog appears for file location selection
- [ ] **FILE-03**: Default filename suggested (transcript-{timestamp}.txt)
- [ ] **FILE-04**: File saved as .txt format with transcript content
- [ ] **FILE-05**: User receives success feedback after save completes
- [ ] **FILE-06**: User receives error feedback if save fails

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Export

- **FILE-07**: Export to Markdown (.md) format
- **FILE-08**: Auto-save transcript after session ends
- **FILE-09**: Remember last save location
- **FILE-10**: Keyboard shortcut (Cmd+S) for quick save

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| PDF export | High complexity, not requested |
| DOC export | High complexity, not requested |
| Cloud storage export | Not in scope - local files only |
| Auto-save | Creates file management complexity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILE-01 | Phase 1 | Pending |
| FILE-02 | Phase 1 | Pending |
| FILE-03 | Phase 1 | Pending |
| FILE-04 | Phase 1 | Pending |
| FILE-05 | Phase 1 | Pending |
| FILE-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after roadmap creation*
