# Phase 2: Translation Service - Research

**Researched:** 2026-03-07
**Domain:** Backend translation service using OpenAI API with caching
**Confidence:** HIGH

## Summary

This phase implements a TranslationService using OpenAI's Chat Completions API (the standard approach for translation - no dedicated translation endpoint exists). The service uses system prompts to instruct GPT models to translate text, supports auto-detecting source language, caches results by source text hash, and returns original text with error indicator on failure. The project already has `openai: ^4.70.0` installed and follows a clear service pattern (e.g., `summaryService.js`, `whisperService.js`).

**Primary recommendation:** Create `TranslationService` in `src/features/common/services/` using the existing `createLLM` pattern from the OpenAI provider, with an in-memory Map cache for translation results.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Auto-detect source language** - Service detects source language automatically
- **On detection failure** - Return original text unchanged with error indicator (aligns with SERV-03)
- **Supported languages** - All languages OpenAI supports (100+)
- **Override allowed** - Callers can optionally provide source language to override auto-detection

### Claude's Discretion
[No specific discretion areas defined - user deferred to standard approaches]

### Deferred Ideas (OUT OF SCOPE)
- Translation API model selection - gpt-4o-mini vs gpt-4o tradeoffs (Phase 2 or backlog)
- Caching strategy - in-memory vs file vs DB (Phase 2 or backlog)
- Error handling specifics - retry logic, rate limiting (Phase 2 or backlog)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SERV-01 | TranslationService can translate text using OpenAI API | Using Chat Completions API with system prompt - established pattern |
| SERV-02 | Translation results are cached by source text hash | In-memory Map cache with hash key (SHA-256 of source+target lang) |
| SERV-03 | Translation fails gracefully, returning original text with error indicator | Error handling pattern from existing services (summaryService.js line 185) |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| openai | ^4.70.0 | OpenAI API client | Already installed in package.json |
| crypto | built-in | Hash generation for cache keys | Node.js built-in, no extra dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| electron-store | ^8.2.0 | Settings persistence | When translation settings need persistence (Phase 3) |

**Installation:**
```bash
# No new packages needed - openai is already installed
npm list openai  # Verify installation
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/features/
├── common/
│   └── services/
│       └── translationService.js    # NEW: Translation service
```

### Pattern 1: Service Class with Singleton Pattern
**What:** Services in this project follow a class-based singleton pattern (e.g., `SummaryService`, `WhisperService`)
**When to use:** When service needs to maintain state between calls
**Example:**
```javascript
// Based on summaryService.js pattern
class TranslationService {
    constructor() {
        this.cache = new Map();  // In-memory cache for translations
    }

    async translate(text, targetLanguage, sourceLanguage = null) {
        // Check cache first
        const cacheKey = this._generateCacheKey(text, targetLanguage, sourceLanguage);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        // ... API call
    }
}

module.exports = new TranslationService();
```

### Pattern 2: OpenAI Chat Completions for Translation
**What:** Use Chat Completions API with a system prompt instructing the model to translate
**When to use:** For any translation task
**Example:**
```javascript
// Source: Context7 /openai/openai-node
const messages = [
    {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${targetLanguage}. ` +
                 `Respond with ONLY the translation, no explanations.`
    },
    {
        role: 'user',
        content: textToTranslate
    }
];

const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',  // Cost-effective for translation
    messages: messages,
    temperature: 0.3  // Lower temperature for consistent translations
});
```

### Pattern 3: Error Handling with Graceful Degradation
**What:** Return original text with error indicator instead of throwing (per SERV-03)
**When to use:** When service must not crash the app
**Example:**
```javascript
// Based on summaryService.js error handling (line 185)
try {
    const result = await this._callTranslationAPI(text, targetLang, sourceLang);
    return { success: true, translatedText: result, error: null };
} catch (error) {
    console.error('[TranslationService] Translation failed:', error.message);
    return {
        success: false,
        translatedText: text,  // Return original
        error: error.message    // Error indicator
    };
}
```

### Pattern 4: Cache Key Generation
**What:** Generate deterministic cache key from source text, target language, and optional source language
**When to use:** For caching translation results
**Example:**
```javascript
const crypto = require('crypto');

_generateCacheKey(text, targetLanguage, sourceLanguage = null) {
    const source = sourceLanguage || 'auto';
    const content = `${source}:${targetLanguage}:${text}`;
    return crypto.createHash('sha256').update(content).digest('hex');
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Translation API | Custom HTTP requests | OpenAI SDK `client.chat.completions.create()` | SDK handles auth, retries, error parsing |
| Cache key hashing | Custom string hashing | Node.js `crypto.createHash('sha256')` | Built-in, deterministic, collision-resistant |
| API client | Manual fetch calls | `createLLM()` from `/features/common/ai/factory.js` | Already integrates with Portkey, existing pattern |

**Key insight:** The project already has a `createLLM` factory pattern in `src/features/common/ai/factory.js` that should be reused. It already handles both direct OpenAI API and Portkey gateway.

---

## Common Pitfalls

### Pitfall 1: Translation Cache Miss Due to Whitespace
**What goes wrong:** Same text with different whitespace produces different cache keys
**Why it happens:** Not normalizing text before hashing
**How to avoid:** Normalize text with `text.trim().replace(/\s+/g, ' ')` before generating cache key
**Warning signs:** Unexpected API calls for seemingly identical translations

### Pitfall 2: API Key Not Available
**What goes wrong:** Translation fails silently or crashes
**Why it happens:** Not checking for API key availability before calling
**How to avoid:** Check `modelStateService.getCurrentModelInfo('llm')` first (pattern from summaryService.js line 101)
**Warning signs:** "AI model or API key is not configured" errors

### Pitfall 3: Language Detection Failing Silently
**What goes wrong:** User expects auto-detection but gets poor translations
**Why it happens:** Model may fail to detect or misdetect language
**How to avoid:** Add explicit instruction in system prompt: "If the source language is unclear, respond with the original text"
**Warning signs:** Translations to same language as source

### Pitfall 4: Large Text Exceeding Token Limits
**What goes wrong:** API returns error for very long transcripts
**Why it happens:** OpenAI has token limits (gpt-4o-mini: ~128K tokens, but practical limit lower)
**How to avoid:** Chunk long text into smaller pieces, translate each, combine results
**Warning signs:** "max_tokens exceeded" or "content too long" errors

---

## Code Examples

### Basic Translation Service Skeleton
```javascript
// src/features/common/services/translationService.js
const crypto = require('crypto');
const { createLLM } = require('../ai/factory');
const modelStateService = require('./modelStateService');

class TranslationService {
    constructor() {
        this.cache = new Map();
        this.defaultModel = 'gpt-4o-mini';  // Cost-effective for translation
    }

    _generateCacheKey(text, targetLanguage, sourceLanguage = null) {
        const normalized = text.trim().replace(/\s+/g, ' ');
        const source = sourceLanguage || 'auto';
        return crypto.createHash('sha256')
            .update(`${source}:${targetLanguage}:${normalized}`)
            .digest('hex');
    }

    async translate(text, targetLanguage, sourceLanguage = null) {
        // Check cache
        const cacheKey = this._generateCacheKey(text, targetLanguage, sourceLanguage);
        if (this.cache.has(cacheKey)) {
            console.log('[TranslationService] Cache hit');
            return this.cache.get(cacheKey);
        }

        // Get API key
        const modelInfo = await modelStateService.getCurrentModelInfo('llm');
        if (!modelInfo || !modelInfo.apiKey) {
            return {
                success: false,
                translatedText: text,
                error: 'API key not configured'
            };
        }

        // Build messages
        const systemPrompt = sourceLanguageYou are a professional
            ? ` translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Respond with ONLY the translation, no explanations.`
            : `You are a professional translator. Detect the source language and translate to ${targetLanguage}. Respond with ONLY the translation, no explanations. If the source language is unclear, respond with the original text.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
        ];

        try {
            const llm = createLLM(modelInfo.provider, {
                apiKey: modelInfo.apiKey,
                model: modelInfo.model || this.defaultModel,
                temperature: 0.3,
                maxTokens: 4096,
                usePortkey: modelInfo.provider === 'openai-glass',
                portkeyVirtualKey: modelInfo.provider === 'openai-glass' ? modelInfo.apiKey : undefined
            });

            const result = await llm.chat(messages);
            const translatedText = result.content;

            // Cache the result
            this.cache.set(cacheKey, {
                success: true,
                translatedText,
                error: null
            });

            return { success: true, translatedText, error: null };
        } catch (error) {
            console.error('[TranslationService] Error:', error.message);
            return {
                success: false,
                translatedText: text,  // Return original per SERV-03
                error: error.message
            };
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = new TranslationService();
```

### Integration with IPC (for future phases)
```javascript
// Example IPC handler (for Phase 5 integration)
const translationService = require('../features/common/services/translationService');

ipcMain.handle('translate-text', async (event, { text, targetLanguage, sourceLanguage }) => {
    const result = await translationService.translate(text, targetLanguage, sourceLanguage);
    return result;
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dedicated Translation API | Chat Completions with system prompt | 2023+ | Simpler, more flexible, same models |
| gpt-4 | gpt-4o-mini | 2024 | 90%+ cheaper for translation tasks |
| No caching | In-memory cache | This phase | Significant cost reduction for repeated text |

**Deprecated/outdated:**
- **OpenAI Whisper API for translation**: Not recommended for text translation (designed for audio transcription with limited language support)
- **google-translate-api package**: Third-party, requires separate API key, not needed when using OpenAI

---

## Open Questions

1. **Should cache persist across app restarts?**
   - What we know: Currently using in-memory Map (ephemeral)
   - What's unclear: Whether cache should survive app restarts for cost savings
   - Recommendation: Start with in-memory, evaluate if file/DB cache needed

2. **Should cache have TTL (time-to-live)?**
   - What we know: No TTL currently planned
   - What's unclear: Translations may become outdated for long transcripts
   - Recommendation: Add optional TTL parameter in future iteration

3. **Which model to use by default?**
   - What we know: `gpt-4o-mini` is cost-effective for translation
   - What's unclear: Whether to use selected LLM model or always default to gpt-4o-mini
   - Recommendation: Use gpt-4o-mini as default, allow override via settings

---

## Sources

### Primary (HIGH confidence)
- [Context7: /openai/openai-node](https://context7.com/openai/openai-node) - Chat Completions API documentation
- [OpenAI Node SDK README](https://github.com/openai/openai-node/blob/master/README.md) - SDK usage patterns
- Project source: `src/features/common/ai/providers/openai.js` - Existing OpenAI integration
- Project source: `src/features/listen/summary/summaryService.js` - Service pattern reference
- Project source: `src/features/settings/settingsService.js` - Settings pattern reference

### Secondary (MEDIUM confidence)
- [OpenAI Pricing](https://openai.com/pricing) - gpt-4o-mini cost effectiveness verification

### Tertiary (LOW confidence)
- None required - sufficient project-specific and official documentation available

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies and patterns
- Architecture: HIGH - Based on established service patterns in codebase
- Pitfalls: MEDIUM - Based on general OpenAI API usage patterns

**Research date:** 2026-03-07
**Valid until:** 30 days (OpenAI API is stable, project patterns unlikely to change)
