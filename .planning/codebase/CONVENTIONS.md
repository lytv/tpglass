# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- JavaScript files: `camelCase.js` (e.g., `authService.js`, `openai.js`)
- TypeScript/React files: `PascalCase.tsx` (e.g., `Sidebar.tsx`, `ClientLayout.tsx`)
- Repository files: `PascalCase.repository.js` (e.g., `firebase.repository.js`, `sqlite.repository.js`)
- Index files: `index.js` or `index.tsx` for barrel exports

**Functions:**
- PascalCase for class methods and constructor functions: `createLLM()`, `validateApiKey()`
- camelCase for regular functions and utility functions: `apiCall()`, `convertFirestoreSession()`

**Variables:**
- camelCase for regular variables: `apiKey`, `userInfo`, `sessionId`
- camelCase with descriptive prefixes for UI elements: `isCollapsed`, `hasApiKey`
- CONSTANTS: `SCREAMING_SNAKE_CASE` for configuration constants (e.g., `ANIMATION_DURATION`, `DIMENSIONS`)

**Types (TypeScript/React):**
- PascalCase for interfaces: `NavigationItem`, `SidebarProps`, `UserProfile`
- Descriptive suffixes: `Props`, `State`, `Config`

## Code Style

**Formatting:**
- Tool: Prettier
- Settings in `.prettierrc`:
  - Semi: true
  - Tab width: 4
  - Print width: 150
  - Single quotes: true
  - Trailing commas: es5
  - Bracket spacing: true
  - Arrow parens: avoid
  - End of line: lf

**Linting:**
- Root Electron app: ESLint (via npm scripts in `package.json`)
- Firebase Functions: ESLint with Google config
- Next.js frontend: ESLint with Next.js config (`eslint-config-next`)

**JavaScript Style:**
- Functions: Prefer arrow callbacks (enforced in Firebase Functions `.eslintrc.js`)
- Quotes: Double quotes in Firebase Functions, single quotes in Prettier for frontend
- Template literals allowed for string interpolation

## Import Organization

**Order:**
1. External libraries (React, Next.js, Firebase)
2. Internal modules (services, repositories, utils)
3. Relative path imports (local components)
4. Type imports (TypeScript)

**Path Aliases:**
- Next.js uses `@/` for source root (e.g., `@/components`, `@/utils`)
- Electron app uses relative paths

**Examples:**
```javascript
// Next.js/React
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { logout, checkApiKeyStatus } from '@/utils/api';
import { useAuth } from '@/utils/auth';

// Electron app
const OpenAI = require('openai');
const WebSocket = require('ws');
const { getProviderForModel } = require('../factory.js');
```

## Error Handling

**Patterns:**

1. **Try-catch with error returns:**
```javascript
async function validateApiKey(key) {
    if (!key || typeof key !== 'string' || !key.startsWith('sk-')) {
        return { success: false, error: 'Invalid OpenAI API key format.' };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.error?.message || `Validation failed with status: ${response.status}`;
            return { success: false, error: message };
        }
    } catch (error) {
        console.error(`[OpenAIProvider] Network error during key validation:`, error);
        return { success: false, error: 'A network error occurred during validation.' };
    }
}
```

2. **Async/await with try-catch in services:**
```javascript
async startFirebaseAuthFlow() {
    try {
        const webUrl = process.env.pickleglass_WEB_URL || 'http://localhost:3000';
        const authUrl = `${webUrl}/login?mode=electron`;
        console.log(`[AuthService] Opening Firebase auth URL in browser: ${authUrl}`);
        await shell.openExternal(authUrl);
        return { success: true };
    } catch (error) {
        console.error('[AuthService] Failed to open Firebase auth URL:', error);
        return { success: false, error: error.message };
    }
}
```

3. **Error throwing in utilities:**
```javascript
if (!vKey) throw new Error('virtual key missing in response');
```

4. **Firebase Functions error handling:**
```javascript
try {
    // ... operation
    response.status(200).send({ success: true, ... });
} catch (error) {
    logger.error("Authentication failed:", error);
    response.status(401).send({
        success: false,
        error: "Invalid token or authentication failed.",
        details: error.message,
    });
}
```

## Logging

**Framework:** Console with prefixes

**Patterns:**
- Service/Component prefixes in brackets: `[AuthService]`, `[OpenAIProvider]`
- Descriptive messages: `User signed in:`, `Opening Firebase auth URL`
- Emoji usage in API utilities: `apiCall (Local Mode):`, `Runtime config loaded:`

**Examples:**
```javascript
console.log(`[AuthService] Firebase user signed in:`, user.uid);
console.error('[AuthService] Failed to open Firebase auth URL:', error);
console.log('Runtime config loaded:', config);
```

## Comments

**When to Comment:**
- JSDoc for public functions and classes (especially in provider modules)
- Complex logic explanations (especially around WebSocket handling, audio processing)
- Configuration options documentation
- TODO comments for future work

**JSDoc/TSDoc:**
- Used in provider modules for configuration options
- Parameters described with types and optional/default values

**Example:**
```javascript
/**
 * Creates an OpenAI STT session
 * @param {object} opts - Configuration options
 * @param {string} opts.apiKey - OpenAI API key
 * @param {string} [opts.language='en'] - Language code
 * @param {object} [opts.callbacks] - Event callbacks
 * @param {boolean} [opts.usePortkey=false] - Whether to use Portkey
 * @param {string} [opts.portkeyVirtualKey] - Portkey virtual key
 * @returns {Promise<object>} STT session
 */
```

## Function Design

**Size:** Generally small, focused functions; complex logic separated into helper functions

**Parameters:**
- Destructuring for configuration objects: `function createLLM({ apiKey, model = 'gpt-4.1', temperature = 0.7, ... })`
- Optional parameters with default values

**Return Values:**
- Consistent return types (promises for async, objects for factories)
- Error objects with `success: boolean` pattern in validation functions

## Module Design

**Exports:**
- Named exports for utilities and helpers
- Single instance exports for services (e.g., `module.exports = authService`)
- Factory functions for providers

**Barrel Files:**
- Used in repository pattern: `repositories/index.js`
- Service aggregators: `src/features/common/ai/factory.js`

**Service Pattern:**
- Singleton pattern for services (e.g., `authService`, `encryptionService`)
- Repository pattern with Firebase/SQLite dual implementations
- Factory pattern for AI providers

---

*Convention analysis: 2026-03-07*
