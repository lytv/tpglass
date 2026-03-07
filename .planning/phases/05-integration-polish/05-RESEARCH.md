# Phase 5: Integration & Polish - Research

**Researched:** 2026-03-08
**Domain:** Electron + React translation integration, IPC communication, real-time settings sync
**Confidence:** HIGH

## Summary

Phase 5 completes the translation feature by integrating the translation service (Phase 2) with the UI display (Phase 4) and enabling real-time settings synchronization between Settings view and Listen view. The core components exist but need wiring.

**Primary recommendation:** Implement IPC bridge handlers for translation, create frontend API client to call translation service, and set up event listeners for real-time settings updates.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Translation auto-triggers on page load when transcript is available
- Translation fetches on every page visit (not cached per session)
- Translation always fetches when there's a transcript available
- Toggle switch controls display mode only (original vs translated), not fetching

### Claude's Discretion
- Implementation approach for IPC bridge
- How to handle translation errors gracefully

### Deferred Ideas (OUT OF SCOPE)
- Real-time settings sync (INTG-02) - noted but not discussed
- Caching translations across sessions - future enhancement
- Remember toggle state from previous session - future enhancement

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTG-01 | Translation triggers automatically when translation is enabled and transcript is available | TranslationService exists in src/features/common/services/translationService.js - needs IPC bridge |
| INTG-02 | Settings changes reflect immediately in Listen view | windowNotificationManager in settingsService.js broadcasts 'translation-settings-updated' - needs frontend listener |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Electron IPC | Built-in | Communication between main and renderer | Native Electron pattern |
| React useState | 18.x | Local component state | Phase 4 uses this |
| Firestore | SDK | Session data storage | Already integrated in project |

### Architecture Components
| Component | Location | Purpose |
|-----------|----------|---------|
| TranslationService | src/features/common/services/translationService.js | Backend translation logic |
| SettingsService | src/features/settings/settingsService.js | Settings storage + notifications |
| WindowNotificationManager | src/features/settings/settingsService.js | Broadcasts settings changes |

## Architecture Patterns

### IPC Bridge Pattern
```
Renderer (React) <--IPC--> Main Process (Electron) <--> Services
```

**Existing pattern in codebase:**
- featureBridge.js handles IPC registration
- windowBridge.js manages window communication
- Settings use `ipcMain.handle()` for request/response

### Implementation Approach

1. **Add translation IPC handlers** in featureBridge.js:
   - `translation:translate` - call TranslationService.translate()
   - `translation:getSettings` - get current translation settings
   - `translation:setSettings` - update translation settings

2. **Frontend API client** in pickleglass_web/utils/:
   - Create translationApi.ts with wrapper functions
   - Use window.api.translation.* pattern (following existing patterns)

3. **Real-time settings sync**:
   - Listen for 'translation-settings-updated' event
   - Update local state when settings change
   - Trigger translation fetch on settings change if transcript available

## Common Pitfalls

### Pitfall 1: Missing IPC Handler Registration
**What goes wrong:** Frontend calls translation API but gets no response
**Why it happens:** IPC handlers not registered in main process
**How to avoid:** Verify handlers registered in featureBridge.js initialize()

### Pitfall 2: Circular Dependency in Services
**What goes wrong:** TranslationService can't load, app crashes
**Why it happens:** Services importing each other incorrectly
**How to avoid:** Use singleton pattern (already in place), import after require()

### Pitfall 3: Event Listener Memory Leaks
**What goes wrong:** Multiple listeners accumulate, performance degrades
**Why it happens:** Not cleaning up event listeners in React useEffect
**How to avoid:** Always return cleanup function from useEffect

### Pitfall 4: Translation Toggle Logic Confusion
**What goes wrong:** Translation fetches even when toggle is OFF
**Why it happens:** Toggle controls display, not fetching (per context decision)
**How to avoid:** Fetch when enabled=true, display when toggle=on

## Code Examples

### IPC Handler Pattern (Main Process)
```javascript
// In featureBridge.js
const { ipcMain } = require('electron');
const translationService = require('../features/common/services/translationService');

function initialize() {
  ipcMain.handle('translation:translate', async (event, { text, targetLanguage, sourceLanguage }) => {
    return await translationService.translate(text, targetLanguage, sourceLanguage);
  });
}
```

### Frontend API Client Pattern
```typescript
// pickleglass_web/utils/translationApi.ts
export const translationApi = {
  translate: async (text: string, targetLanguage: string, sourceLanguage?: string) => {
    const result = await window.api.translation.translate({ text, targetLanguage, sourceLanguage });
    return result;
  }
};
```

### Real-time Settings Listener Pattern (React)
```tsx
// In ListenView or page component
useEffect(() => {
  if (!window.api) return;

  const handleSettingsChange = async (settings: any) => {
    setTranslationEnabled(settings.enabled);
    setTargetLanguage(settings.language);
    // Trigger translation if transcript available and enabled
    if (settings.enabled && transcriptText) {
      await fetchTranslation();
    }
  };

  // Listen for settings changes
  window.api.on('translation-settings-updated', handleSettingsChange);

  return () => {
    window.api.off('translation-settings-updated', handleSettingsChange);
  };
}, []);
```

## Implementation Checklist

### INTG-01: Translation Auto-Trigger
- [ ] Add IPC handler `translation:translate` in featureBridge.js
- [ ] Create frontend translationApi.ts utility
- [ ] Call translation on page load when transcript available and enabled
- [ ] Handle loading states correctly

### INTG-02: Real-time Settings Sync
- [ ] Add event listener for 'translation-settings-updated' in Listen view
- [ ] Update local state when event received
- [ ] Clear old event listeners in useEffect cleanup
- [ ] Test settings change reflects immediately

## Sources

### Primary (HIGH confidence)
- Electron IPC documentation - https://www.electronjs.org/docs/latest/api/ipc-main
- Existing featureBridge.js implementation patterns
- TranslationService.js - current implementation

### Secondary (MEDIUM confidence)
- React useEffect cleanup patterns - https://react.dev/learn/synchronizing-with-effects

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Electron IPC patterns well-established in codebase
- Architecture: HIGH - Similar patterns used for settings
- Pitfalls: HIGH - Common Electron/React issues with known solutions

**Research date:** 2026-03-08
**Valid until:** 30 days (stable domain)
