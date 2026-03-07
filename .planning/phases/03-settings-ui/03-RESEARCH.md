# Phase 3: Settings UI - Research

**Researched:** 2026-03-07
**Domain:** Electron UI / LitElement Components / Settings Persistence
**Confidence:** HIGH

## Summary

This phase adds translation preferences (toggle and language selector) to the existing SettingsView sidebar panel. The project uses Electron with LitElement for UI, electron-store for persistence, and has established patterns for IPC communication between renderer and main process.

**Primary recommendation:** Extend the existing SettingsView component with translation settings, add new IPC handlers in settingsService.js, and expose them via preload.js using the established patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use a switch toggle (iOS-style), not checkbox
- Searchable dropdown with search input for language selection
- Shows 20+ common languages
- Add to existing SettingsView.js sidebar panel (240px width, LitElement)

### Claude's Discretion
- Toggle placement within settings panel (top/middle/bottom)
- Exact default values for translation enabled (off) and default language (English)
- Persistence key naming and structure in electron-store

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETT-01 | User can enable/disable translation in Settings | iOS-style toggle implementation in LitElement |
| SETT-02 | User can select target language for translation | Searchable dropdown component pattern |
| SETT-03 | Translation settings persist across app restarts | electron-store usage patterns in settingsService.js |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| LitElement | 2.7.4 | UI component framework | Already used in SettingsView.js |
| electron-store | 8.2.0 | Persistent key-value storage | Already used in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| electron (ipcMain/ipcRenderer) | 30.5.1 | Main/renderer communication | For exposing settings to UI |
| preload.js | N/A | Context bridge | Already exists with settingsView pattern |

**Installation:**
No new packages required - all needed libraries already in project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   └── settings/
│       └── settingsService.js    # Add translation settings handlers
├── ui/
│   └── settings/
│       └── SettingsView.js       # Add translation UI section
├── preload.js                    # Add translation IPC methods
```

### Pattern 1: Settings Persistence via electron-store
**What:** Storing and retrieving settings using electron-store with user scoping
**When to use:** For any persistent settings that need to survive app restarts
**Example:**
```javascript
// From src/features/settings/settingsService.js (lines 11-16)
const store = new Store({
    name: 'pickle-glass-settings',
    defaults: {
        users: {}
    }
});

// Getting settings (lines 221-235)
async function getSettings() {
    const uid = authService.getCurrentUserId();
    const userSettingsKey = uid ? `users.${uid}` : 'users.default';
    const savedSettings = store.get(userSettingsKey, {});
    return { ...defaultSettings, ...savedSettings };
}

// Saving settings (lines 237-256)
async function saveSettings(settings) {
    const uid = authService.getCurrentUserId();
    const userSettingsKey = uid ? `users.${uid}` : 'users.default';
    store.set(userSettingsKey, settings);
    // Notify windows of change
    windowNotificationManager.notifyRelevantWindows('settings-updated', settings);
}
```

### Pattern 2: IPC Exposure via preload.js
**What:** Exposing main process functions to renderer via contextBridge
**When to use:** For any main process functionality needed by UI components
**Example:**
```javascript
// From src/preload.js (lines 209-267)
settingsView: {
    // Existing pattern for settings
    getPresets: () => ipcRenderer.invoke('settings:getPresets'),
    getAutoUpdate: () => ipcRenderer.invoke('settings:get-auto-update'),
    setAutoUpdate: (isEnabled) => ipcRenderer.invoke('settings:set-auto-update', isEnabled),

    // Listeners use ipcRenderer.on/removeListener
    onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', callback),
    removeOnSettingsUpdated: (callback) => ipcRenderer.removeListener('settings-updated', callback),
}
```

### Pattern 3: LitElement Component Properties
**What:** Reactive properties pattern in LitElement for state management
**When to use:** For any UI component needing reactive state
**Example:**
```javascript
// From SettingsView.js (lines 483-508)
static properties = {
    shortcuts: { type: Object, state: true },
    firebaseUser: { type: Object, state: true },
    isLoading: { type: Boolean, state: true },
    // ... add translationEnabled, selectedLanguage, etc.
};

constructor() {
    super();
    this.shortcuts = {};
    this.translationEnabled = false;
    this.selectedLanguage = 'en';
}
```

### Pattern 4: iOS-Style Toggle Switch in CSS
**What:** Custom toggle switch using CSS
**When to use:** When implementing the translation on/off toggle
**Example:**
```css
/* CSS toggle switch pattern */
.toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.toggle-switch.active {
    background: rgba(0, 122, 255, 0.8);
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
}

.toggle-switch.active::after {
    transform: translateX(20px);
}
```

### Pattern 5: Searchable Dropdown in LitElement
**What:** Custom searchable dropdown with filter input
**When to use:** For language selection requiring 20+ options
**Example structure:**
```javascript
// Component state
this.languageSearchQuery = '';
this.isLanguageDropdownOpen = false;

// Computed filtered languages
get filteredLanguages() {
    const query = this.languageSearchQuery.toLowerCase();
    return LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
}

// Render pattern
html`
    <div class="dropdown-container" @click=${() => this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen}>
        <input type="text"
            .value=${this.languageSearchQuery}
            @input=${(e) => this.languageSearchQuery = e.target.value}
            placeholder="Search languages..."
        />
        <div class="dropdown-list ${this.isLanguageDropdownOpen ? 'open' : ''}">
            ${this.filteredLanguages.map(lang => html`
                <div class="dropdown-item" @click=${() => this.selectLanguage(lang)}>
                    ${lang.name}
                </div>
            `)}
        </div>
    </div>
`
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settings persistence | Custom JSON file handling | electron-store | Already handles atomic writes, defaults, encryption |
| IPC communication | Custom message passing | Existing ipcMain/ipcRenderer pattern | Established security model |
| UI component state | Vanilla JS state | LitElement properties | Reactive updates, efficient rendering |

**Key insight:** The project already has robust patterns for settings management. Adding translation settings should follow the same patterns.

## Common Pitfalls

### Pitfall 1: Forgetting to Notify Windows of Settings Changes
**What goes wrong:** Other components don't see updated settings immediately
**Why it happens:** Calling store.set() without triggering window notification
**How to avoid:** Use windowNotificationManager.notifyRelevantWindows() after saving
**Warning signs:** Settings changed but UI doesn't reflect new values

### Pitfall 2: Not Loading Initial Settings on Component Mount
**What goes wrong:** UI shows defaults even when stored values exist
**Why it happens:** Forgetting to load persisted settings in connectedCallback()
**How to avoid:** Call loading function in connectedCallback(), set initial properties
**Warning signs:** Always shows default values after app restart

### Pitfall 3: Dropdown Not Filtering Properly
**What goes wrong:** Search input doesn't filter language list
**Why it happens:** Not using computed/filtered property or not updating on input
**How to avoid:** Use reactive property for search query, computed property for filtered list
**Warning signs:** All languages shown regardless of search input

### Pitfall 4: Missing IPC Handler Registration
**What goes wrong:** Renderer calls fail with "cannot invoke before startup"
**Why it happens:** Not registering ipcMain.handle() in main process
**How to avoid:** Follow existing pattern: ipcMain.handle('settings:xxx', handler)
**Warning signs:** "Error invoking remote method" in console

## Code Examples

### Language List (20+ Common Languages)
```javascript
// Recommended language list for dropdown
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'cs', name: 'Czech' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'no', name: 'Norwegian' },
];
```

### Adding Translation Settings to electron-store
```javascript
// In settingsService.js - Add to defaults
const store = new Store({
    name: 'pickle-glass-settings',
    defaults: {
        users: {},
        // Add translation defaults
        translation: {
            enabled: false,
            targetLanguage: 'en'
        }
    }
});

// New handlers to add
ipcMain.handle('settings:getTranslationSettings', async () => {
    const settings = await getSettings();
    return {
        enabled: settings.translationEnabled || false,
        targetLanguage: settings.translationLanguage || 'en'
    };
});

ipcMain.handle('settings:setTranslationSettings', async (event, { enabled, targetLanguage }) => {
    const settings = await getSettings();
    settings.translationEnabled = enabled;
    settings.translationLanguage = targetLanguage;
    return await saveSettings(settings);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Checkbox for toggles | iOS-style toggle switches | Modern UI expectation | Better UX, clearer on/off state |
| Native select dropdown | Custom searchable dropdown | When >10 options needed | Faster filtering for language selection |
| LocalStorage | electron-store | Project start | More secure, handles electron-specific issues |

**Deprecated/outdated:**
- None applicable to this phase

## Open Questions

1. **Toggle Placement**
   - What we know: CONTEXT.md says Claude has discretion on placement (top/middle/bottom)
   - What's unclear: Which position provides best UX given existing settings sections
   - Recommendation: Place after "Automatic Updates" toggle (near other enable/disable settings)

2. **Default Language**
   - What we know: English is most common, CONTEXT.md allows discretion
   - What's unclear: Should default match system locale?
   - Recommendation: Default to 'en' (English) as specified in context

3. **Persistence Key Structure**
   - What we know: electron-store already has user-scoped settings
   - What's unclear: Add as top-level keys or nested under 'translation' object?
   - Recommendation: Add as top-level keys (translationEnabled, translationLanguage) for simplicity, matching existing pattern

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |
| Estimated runtime | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETT-01 | Toggle translation on/off | Manual | N/A - UI component | No test infrastructure |
| SETT-02 | Select target language from dropdown | Manual | N/A - UI component | No test infrastructure |
| SETT-03 | Settings persist across restarts | Manual | N/A - UI component | No test infrastructure |

### Nyquist Sampling Rate
- **Minimum sample interval:** N/A - No test framework detected
- **Full suite trigger:** N/A
- **Phase-complete gate:** Manual verification required
- **Estimated feedback latency per task:** N/A

### Wave 0 Gaps (must be created before implementation)
- [ ] `tests/` - Project needs test directory structure
- [ ] `tests/settings.test.js` - Unit tests for settingsService.js
- [ ] `tests/translation-settings.test.js` - Integration tests for translation settings IPC
- Note: UI component testing (LitElement) typically requires manual testing or additional framework setup (e.g., @open-wc/testing)

**Recommendation:** For this phase, implement manual verification steps in PLAN.md since the project lacks test infrastructure. Consider adding basic test coverage as a separate task.

## Sources

### Primary (HIGH confidence)
- Project codebase analysis - settingsService.js, preload.js, SettingsView.js
- electron-store v8.2.0 documentation (in package.json)

### Secondary (MEDIUM confidence)
- LitElement component patterns - existing SettingsView.js implementation
- CSS toggle switch patterns - industry standard iOS-style

### Tertiary (LOW confidence)
- N/A

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, patterns well-established
- Architecture: HIGH - Existing patterns for settings, IPC, and UI components
- Pitfalls: HIGH - Based on existing code analysis and common Electron/LitElement issues

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (30 days - stable domain)
