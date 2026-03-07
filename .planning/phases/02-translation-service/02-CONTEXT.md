# Phase 2: Translation Service - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend translation capability using OpenAI API with caching and error handling. This phase delivers the TranslationService — a callable module that other parts of the app (settings UI, display integration) will use. Does NOT include UI, settings persistence, or end-to-end integration — those come in later phases.

</domain>

<decisions>
## Implementation Decisions

### Language Detection
- **Auto-detect source language** — Service detects source language automatically
- **On detection failure** — Return original text unchanged with error indicator (aligns with SERV-03)
- **Supported languages** — All languages OpenAI supports (100+)
- **Override allowed** — Callers can optionally provide source language to override auto-detection

</decisions>

<specifics>
## Specific Ideas

No specific references provided — user deferred to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

- Translation API model selection — gpt-4o-mini vs gpt-4o tradeoffs (Phase 2 or backlog)
- Caching strategy — in-memory vs file vs DB (Phase 2 or backlog)
- Error handling specifics — retry logic, rate limiting (Phase 2 or backlog)

These areas were not discussed but may be relevant for planning.

</deferred>

---

*Phase: 02-translation-service*
*Context gathered: 2026-03-07*
