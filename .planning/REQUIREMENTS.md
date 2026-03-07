# Requirements: PickleGlass Translation Feature

**Defined:** 2026-03-07
**Milestone:** v1.1

## v1.1 Requirements

### Settings

- [ ] **SETT-01**: User can enable/disable translation in Settings
- [ ] **SETT-02**: User can select target language for translation
- [ ] **SETT-03**: Translation settings persist across app restarts

### Translation Service

- [ ] **SERV-01**: TranslationService can translate text using OpenAI API
- [ ] **SERV-02**: Translation results are cached to avoid redundant API calls
- [ ] **SERV-03**: Translation fails gracefully, showing original text with error indicator

### Display

- [ ] **DISP-01**: User can view translated transcript in Listen view
- [ ] **DISP-02**: User can toggle between original and translated text
- [ ] **DISP-03**: Loading indicator shows during translation
- [ ] **DISP-04**: Copy translation button allows copying translated text to clipboard

### Integration

- [ ] **INTG-01**: Translation triggers automatically when translation is enabled and transcript is available
- [ ] **INTG-02**: Settings changes reflect immediately in Listen view

## v2 Requirements (Deferred)

### Advanced Display

- **DISP-05**: Side-by-side view showing original and translation simultaneously
- **DISP-06**: Real-time translation during active listening session

### Cost Management

- **SERV-04**: User can see translation character count / API usage
- **SERV-05**: User can set translation budget or disable auto-translate

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline translation (local ML) | Requires 100MB+ model, not needed for v1.1 |
| Real-time streaming translation | Adds WebSocket complexity, defer to v2 |
| Speech-to-speech translation | Requires TTS synthesis, out of scope |
| Translation history | Not requested, adds storage complexity |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETT-01 | Phase 1 | Pending |
| SETT-02 | Phase 1 | Pending |
| SETT-03 | Phase 1 | Pending |
| SERV-01 | Phase 2 | Pending |
| SERV-02 | Phase 2 | Pending |
| SERV-03 | Phase 2 | Pending |
| DISP-01 | Phase 3 | Pending |
| DISP-02 | Phase 3 | Pending |
| DISP-03 | Phase 3 | Pending |
| DISP-04 | Phase 3 | Pending |
| INTG-01 | Phase 4 | Pending |
| INTG-02 | Phase 4 | Pending |

**Coverage:**
- v1.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after v1.1 milestone started*
