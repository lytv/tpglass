# Pitfalls Research

**Domain:** Electron Desktop App - Translation Feature (v1.1)
**Researched:** 2026-03-07
**Confidence:** MEDIUM-HIGH

*Note: This PITFALLS.md is specific to adding translation capability to an existing speech-to-text desktop app (PickleGlass). It focuses on integration pitfalls, not generic translation issues.*

## Critical Pitfalls

### Pitfall 1: Translation Latency Breaks Real-Time Expectation

**What goes wrong:**
Users expect transcript to appear in real-time like the original STT output. Adding translation adds 200-2000ms API call latency, causing translated text to appear significantly after the original. This creates a jarring, broken user experience.

**Why it happens:**
Translation APIs (Google Translate, DeepL, etc.) require network round-trip. Even fast APIs add hundreds of milliseconds. Unlike STT which streams partial results, translation typically requires complete text before processing.

**How to avoid:**
- Show original transcript immediately, display translated text asynchronously
- Use optimistic UI: show original with "translating..." indicator, then replace with translation
- Consider translating in chunks (sentence-by-sentence) rather than waiting for full transcript
- Implement translation caching for repeated content

**Warning signs:**
- UI freezes while waiting for translation
- Translated text appears in large batches rather than streaming
- Users report "translation is slow" or "text appears late"

**Phase to address:**
Phase implementing translation display in Listen view - must handle async translation gracefully

---

### Pitfall 2: Cascading STT Errors Through Translation

**What goes wrong:**
STT misrecognitions get "locked in" by translation. If speech recognition outputs "I saw a bear" but user said "I saw a bear", translation to Spanish produces "vi un oso" (correct for "bear") instead of "vi una bara" (what was actually spoken). The translation looks correct but reflects wrong original text.

**Why it happens:**
Translation trusts its input. STT errors compound through the pipeline - translation cannot correct recognition mistakes.

**How to avoid:**
- Add visual indicator showing original text is editable before translation
- Consider offering "edit before translate" workflow
- If using streaming STT, wait for finalization before translating critical segments
- Document this limitation for users

**Warning signs:**
- Translations look correct but don't match what user actually said
- User confusion about why translation is "wrong"
- No way to correct STT errors that affect translation

**Phase to address:**
Phase implementing translation service - must consider error propagation

---

### Pitfall 3: Uncontrolled API Costs

**What goes wrong:**
Translation API costs spiral out of control. Per-character pricing (Google Translate: ~$20/million characters for advanced) means long transcripts or frequent use creates unexpected bills. No cost controls lead to budget overruns.

**Why it happens:**
- No character count limits or warnings configured
- Translation enabled by default for all users
- No caching of translated content
- No batch optimization (small requests have higher overhead)

**How to avoid:**
- Add character count display in UI so users see usage
- Implement translation caching (store translations by content hash)
- Add optional "translate only on demand" setting
- Configure API quotas if available
- Use batching: combine multiple segments into single API calls
- Set up billing alerts

**Warning signs:**
- No character count shown to users
- Every transcript automatically translated regardless of user intent
- No caching mechanism

**Phase to address:**
Phase implementing translation service - must include cost controls

---

### Pitfall 4: No Graceful Degradation When Translation API Fails

**What goes wrong:**
Network issues, API quota exceeded, or service outages cause translation to fail completely. App crashes, shows error, or breaks the transcript display entirely instead of gracefully falling back.

**Why it happens:**
- No try/catch around translation API calls
- No fallback to show original text when translation fails
- No retry logic for transient failures
- No offline indicator

**How to avoid:**
```javascript
async function translateWithFallback(text, targetLang) {
  try {
    return await translationAPI.translate(text, targetLang);
  } catch (error) {
    console.warn('Translation failed:', error.message);
    return { translatedText: text, error: 'Translation unavailable', fallback: true };
  }
}
```
- Always return original text with error indicator when translation fails
- Implement retry with exponential backoff for transient errors
- Show clear "Translation unavailable" state in UI

**Warning signs:**
- App shows blank or error state when API is down
- No retry mechanism for failed requests
- User cannot see transcript at all when translation fails

**Phase to address:**
Phase implementing translation API integration - must handle failures gracefully

---

### Pitfall 5: Blocking Main Thread / UI During Translation

**What goes wrong:**
Translation API calls made from renderer or main process block UI, causing app to freeze. Long transcripts cause extended freezes.

**Why it happens:**
- Synchronous translation calls
- Translation in main process without async
- Large payload blocking event loop

**How to avoid:**
- Always use async/await for translation API calls
- Consider translation in background worker if available
- Process in chunks to keep UI responsive
- Show loading indicator rather than freeze

**Warning signs:**
- UI becomes unresponsive during translation
- "Spinning wheel" cursor during transcript processing
- No loading states visible

**Phase to address:**
Phase implementing translation IPC handlers - must be async

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Translate entire transcript at end | Simple implementation | Long wait time, user sees nothing until complete | Only if real-time translation not required |
| No translation caching | Simpler code | Repeated translation of same content = higher costs | Only for MVP with low usage |
| Hardcode single language | Faster to implement | Users can't choose target language | Never - selector required per spec |
| Skip error handling for "simple" API | Faster to write | App breaks on any API issue | Never |
| Client-side translation only | No API costs | Poor quality, limited languages | Never - requires server-side for quality |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Translation API | Sending empty or whitespace-only strings | Trim and skip translation for empty content |
| Translation API | Not handling API rate limits | Implement rate limiting, queue requests |
| Translation API | Exceeding request size limits | Chunk large text (Google: 5K chars optimal, 30K max) |
| IPC for translation | Blocking renderer with sync calls | All translation via async IPC |
| Settings storage | Not persisting language preference | Use electron-store or similar for settings |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Translating every STT partial result | Excessive API calls, high costs | Only translate final/stable transcript segments | Always - translate on finalization |
| No caching | Repeated API calls for same text | Cache translations by content hash | When users replay sessions |
| Large payload without chunking | API errors, timeouts | Split into 5K char chunks | Transcripts > 5K characters |
| No request debouncing | Rapid fire API calls on streaming | Debounce translation requests by 500ms | Real-time streaming mode |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Logging full transcripts with translations | Privacy breach - exposes user content | Sanitize logs, don't log translation content |
| No API key protection | Key exposure, unauthorized usage | Use environment variables, never commit keys |
| Sending sensitive content to third-party API | Data leaves user's machine without consent | Add clear notice, make translation optional |
| No input sanitization | Prompt injection in translation prompts | Sanitize text before sending to API |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No way to verify translation quality | User trusts wrong translation | Show original and translated side-by-side |
| Translation appears magically | User confused about what's happening | Show "translating..." indicator |
| Can't copy original text | User wants original, not translation | Provide both original and translated copy options |
| Target language not persisted | User must select language every session | Persist language preference in settings |
| No toggle to disable translation | User wants original only | Translation toggle in settings (per spec) |

---

## "Looks Done But Isn't" Checklist

- [ ] **Translation:** API key configured but no error handling for auth failures
- [ ] **Translation:** Language selector present but doesn't save preference
- [ ] **Translation:** Translation toggle in settings but not wired to enable/disable
- [ ] **Translation:** Translation works but blocks UI during API call
- [ ] **Translation:** Translation fails silently with no user feedback
- [ ] **Translation:** No character count shown before/after translation
- [ ] **Translation:** Caching implemented but cache never invalidates
- [ ] **Translation:** Large transcript causes API failure (size limits exceeded)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|-----------------|
| API quota exceeded | LOW | Implement retry with backoff, show user-friendly message |
| Network failure during translation | LOW | Show original with "translation unavailable" badge |
| Translation quality poor | MEDIUM | Add "show original" option, don't replace original |
| Cost overrun | MEDIUM | Add usage tracking, implement caching, add user limits |
| Blocked UI | LOW | Move to async IPC, show loading state |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Translation latency breaking UX | Phase implementing translation display | Test with long transcript, verify original shows immediately |
| Cascading STT errors | Phase implementing translation service | Test with intentionally misrecognized speech |
| Uncontrolled API costs | Phase implementing translation API | Monitor API usage, verify caching works |
| No graceful degradation | Phase implementing translation API | Disconnect network, verify fallback works |
| Blocking main thread | Phase implementing translation IPC | Test with large transcript, verify UI stays responsive |
| Settings not wired | Phase implementing Settings UI | Toggle translation off, verify it stops |
| No error feedback | Phase implementing translation display | Trigger translation error, verify message shown |

---

## Sources

- [Google Cloud Translation API Documentation](https://cloud.google.com/translate/docs) - API limits, pricing, best practices
- [Google Translate API Pricing](https://costgoat.com/pricing/google-translate) - Cost optimization guidance
- [Translation API Best Practices](https://cloud.google.com/blog/products/ai-machine-learning/four-best-practices-for-translating-your-website) - Caching, batching recommendations
- [Microsoft Fast Transcription API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/fast-transcription-create) - Retry logic recommendations
- [DEV.to: APIs for Translation](https://dev.to/elenahartmann/apis-for-translation-what-to-know-before-you-integrate-59n8) - Integration considerations
- [ScienceDirect: End-to-End Speech-to-Text Translation Survey](https://www.sciencedirect.com/science/article/abs/pii/S0885230824001347) - Latency challenges in speech translation

---

*Pitfalls research for: Translation Feature (v1.1) - Adding translation to speech-to-text app*
*Researched: 2026-03-07*
