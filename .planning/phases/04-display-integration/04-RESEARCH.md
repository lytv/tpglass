# Phase 4: Display Integration - Research

**Researched:** 2026-03-07
**Domain:** Next.js React frontend, Tailwind CSS, translation display UI
**Confidence:** HIGH

## Summary

Phase 4 implements the display integration for translated transcripts in the Listen view (activity details page). The frontend uses Next.js 14 with React 18, Tailwind CSS for styling, and Lucide React for icons. Translation settings are stored via localStorage (client-side persistence).

**Primary recommendation:** Add translation toggle and translated text display to the existing transcript section in `/app/activity/details/page.tsx`. Use React state to manage toggle state and display. Use Clipboard API for copy functionality.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Side-by-side layout: original text on left, translated on right
- On mobile: stacks vertically (original on top, translated below)
- Visual divider line between original and translated panels
- Toggle switch control for toggling between original and translated
- Global header toggle at top of Listen view (affects all transcripts)
- Translation icon as toggle label
- Default state: off by default (shows original text)
- Spinner centered in translated panel while loading
- Uses app theme color (matches other spinners)
- Instant switch when translation completes (no fade transition)

### Claude's Discretion
- [None specified - all UI decisions are locked]

### Deferred Ideas (OUT OF SCOPE)
- Per-card toggle for individual control - future enhancement
- Side-by-side on mobile with horizontal scroll - deferred to v2
- Fade transition - not needed for v1

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISP-01 | User can view translated transcript in Listen view | Transcript display already exists; adding translated text panel with conditional rendering based on translation settings |
| DISP-02 | User can toggle between original and translated text | React state toggle; switching between original text and translated text display |
| DISP-03 | Loading indicator shows during translation | Loading spinner centered in translated panel; state management for loading |
| DISP-04 | Copy translation button allows copying translated text to clipboard | Clipboard API (navigator.clipboard.writeText); copy icon button |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^14.2.30 | React framework | Already in use |
| React | ^18 | UI library | Already in use |
| Tailwind CSS | ^3.3.0 | Styling | Already in use |
| Lucide React | ^0.294.0 | Icons | Already in use for copy icon |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React State | built-in | Toggle state, loading state | All requirements |
| Clipboard API | browser native | Copy to clipboard | DISP-04 |
| localStorage | browser native | Persist translation settings | Read settings from existing storage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clipboard API | document.execCommand('copy') | Legacy, less reliable |
| Custom toggle | Headless UI Switch | Overkill for simple toggle |

**No additional packages needed.**

---

## Architecture Patterns

### Recommended Implementation Location
```
pickleglass_web/
├── app/activity/details/
│   └── page.tsx          # Add translation toggle and display
├── components/           # (optional) Create TranslationToggle component
└── utils/
    └── api.ts            # Add translation API call (if needed)
```

### Pattern 1: Translation Toggle in Listen View
**What:** Add a toggle switch at the top of the transcript section to switch between original and translated text
**When to use:** DISP-02 requirement
**Example:**
```tsx
// Toggle state
const [showTranslation, setShowTranslation] = useState(false);

// Toggle UI
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">Original</span>
  <button
    onClick={() => setShowTranslation(!showTranslation)}
    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
  >
    <span className="sr-only">Enable translation</span>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${showTranslation ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
  <span className="text-sm text-gray-600">Translated</span>
</div>
```

### Pattern 2: Side-by-Side Display
**What:** Display original text on left, translated on right with divider
**When to use:** DISP-01 requirement
**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Original text panel */}
  <div className="border-r border-gray-200 pr-4">
    {transcripts.map(item => (...))}
  </div>
  {/* Translated text panel */}
  <div className="pl-4">
    {isLoading ? (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    ) : (
      translatedTexts.map(item => (...))
    )}
  </div>
</div>
```

### Pattern 3: Copy Button
**What:** Copy button with Clipboard API
**When to use:** DISP-04 requirement
**Example:**
```tsx
import { Copy } from 'lucide-react';

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Show success toast
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// In render
<button onClick={() => handleCopy(translatedText)}>
  <Copy className="h-4 w-4" />
</button>
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toggle component | Build custom toggle from scratch | Tailwind toggle or simple button | Simpler, already in codebase style |
| Clipboard functionality | Use deprecated execCommand | Clipboard API (navigator.clipboard) | Modern, reliable |
| Loading spinner | Build custom spinner | Existing Tailwind animate-spin | Consistent with app theme |

---

## Common Pitfalls

### Pitfall 1: State Not Persisted
**What goes wrong:** Translation toggle resets on page refresh
**Why it happens:** React state is not saved to localStorage
**How to avoid:** Read translation enabled state from localStorage on mount
**Warning signs:** Toggle resets when navigating away and back

### Pitfall 2: Translation API Called Multiple Times
**What goes wrong:** Each toggle triggers new API call even for same content
**Why it happens:** No caching of translated results in frontend
**How to avoid:** Cache translated text in React state or localStorage keyed by transcript ID

### Pitfall 3: Mobile Layout Breakage
**What goes wrong:** Side-by-side layout doesn't work on mobile
**Why it happens:** Missing responsive grid classes
**How to avoid:** Use `grid-cols-1 md:grid-cols-2` for mobile stack, desktop side-by-side

---

## Code Examples

### Reading Translation Settings from localStorage
```typescript
// Source: Standard browser API
const getTranslationEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const settings = localStorage.getItem('pickleglass_translation_settings');
  if (settings) {
    try {
      return JSON.parse(settings).enabled || false;
    } catch {
      return false;
    }
  }
  return false;
};
```

### Responsive Side-by-Side with Divider
```tsx
// Source: Tailwind CSS patterns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
    {/* Original text */}
  </div>
  <div className="pt-4 md:pt-0 md:pl-4">
    {/* Translated text */}
  </div>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single text display | Side-by-side original/translated | This phase | New UI pattern |
| No translation toggle | Global header toggle | This phase | New interaction |
| No copy button | Copy button with Clipboard API | This phase | New feature |

**No deprecated approaches in use.**

---

## Open Questions

1. **Where is translation service called?**
   - What we know: Phase 2 created TranslationService in backend
   - What's unclear: How frontend calls translation API - direct or via backend?
   - Recommendation: Check Phase 2 implementation; likely backend endpoint needed

2. **Should translated text be stored or computed?**
   - What we know: Could cache in localStorage
   - What's unclear: Performance vs storage tradeoffs
   - Recommendation: Store in React state first; localStorage caching can be v2

---

## Sources

### Primary (HIGH confidence)
- Next.js 14 App Router documentation - https://nextjs.org/docs
- React 18 useState hook - https://react.dev/reference/react/useState
- Tailwind CSS Grid - https://tailwindcss.com/docs/grid
- Lucide React Icons - https://lucide.dev/icons

### Secondary (MEDIUM confidence)
- Clipboard API MDN - https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Standard React patterns
- Pitfalls: HIGH - Common React mistakes with known solutions

**Research date:** 2026-03-07
**Valid until:** 30 days (stable stack)
