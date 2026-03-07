# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

### Missing Checksum Validation for Downloads
- **Issue:** Download verification checksums are set to `null` in production, effectively skipping security validation
- **Files:** `src/features/common/config/checksums.js`
- **Impact:** Downloads from Ollama and Whisper binaries could be tampered with or corrupted without detection
- **Fix approach:** Add actual SHA256 checksums for Ollama DMG, EXE, and Whisper binaries. Currently only Whisper model files have proper checksums.

### Incomplete Encryption Implementation
- **Issue:** Encryption service falls back to in-memory keys when keytar is unavailable, with no persistent storage across restarts
- **Files:** `src/features/common/services/encryptionService.js`
- **Impact:** If keytar (native dependency) fails to load, user data encryption is weakened - keys are session-only
- **Fix approach:** Implement alternative secure storage mechanism for environments where keytar is unavailable (e.g., encrypted file storage)

### Hardcoded Firebase Configuration in Frontend
- **Issue:** Firebase API keys and configuration are hardcoded in web client
- **Files:** `pickleglass_web/utils/firebase.ts`
- **Impact:** Exposes Firebase configuration publicly. While this is common for Firebase web apps (they require client-side config), it enables potential abuse of Firebase quotas
- **Fix approach:** Consider implementing Firebase App Check or rate limiting on Firebase services

### Deprecated/Circular Comments in Code
- **Issue:** Code contains placeholder comments like `////// before_modelStateService //////` that indicate incomplete refactoring
- **Files:** `src/features/common/services/authService.js` (lines 192-195, 203-205)
- **Impact:** Confusing for developers maintaining the code
- **Fix approach:** Remove legacy comments after verifying refactoring is complete

## Known Bugs

### Animation Logic Bug in API Key Header
- **Symptoms:** Korean TODO comment indicates animation overflow issue in `ApiKeyHeader.js`
- **Files:** `src/ui/app/ApiKeyHeader.js` (line 1625)
- **Trigger:** When API key header animations are triggered
- **Workaround:** Unknown - no fix identified

### Ollama Windows Fallback Not Implemented
- **Issue:** TODO comment indicates Windows fallback logic is not implemented
- **Files:** `src/features/common/services/ollamaService.js` (line 844)
- **Impact:** Ollama installation may fail on Windows without graceful handling
- **Workaround:** None documented

### Whisper Processing Loop Not Implemented
- **Issue:** TODO comment indicates actual processing loop is not implemented
- **Files:** `src/features/common/services/whisperService.js` (lines 811, 820)
- **Impact:** Whisper transcription may not function properly after initial setup
- **Workaround:** Unknown

## Security Considerations

### Hardcoded API Endpoints
- **Risk:** Production API endpoint is hardcoded without environment variable fallback in some places
- **Files:** `src/features/common/services/authService.js`
- **Current mitigation:** Uses environment variable `pickleglass_WEB_URL` with localhost fallback
- **Recommendations:** Ensure production deployment sets this environment variable; consider DNS-based service discovery

### Firebase Admin Initialization Without Service Account
- **Risk:** Firebase Admin SDK initialized without explicit service account credentials
- **Files:** `functions/index.js`
- **Current mitigation:** Relies on Firebase default credentials (environment variables or attached service account)
- **Recommendations:** Explicitly configure service account for production deployments

### CORS Configuration Allows All Origins
- **Risk:** CORS is configured with `{origin: true}` allowing all origins
- **Files:** `functions/index.js` (line 13)
- **Current mitigation:** None
- **Recommendations:** Restrict CORS to specific domains in production

### Environment Variable Security
- **Risk:** Multiple services use `process.env` without validation
- **Files:** Multiple files across `src/features/common/`
- **Current mitigation:** Most services have fallback values
- **Recommendations:** Add startup validation for required environment variables

## Performance Bottlenecks

### Duplicate Model Listing Logic
- **Problem:** Ollama service has multiple methods for getting installed models (`getInstalledModels`, `getInstalledModelsList`, `getLoadedModels`) with overlapping functionality
- **Files:** `src/features/common/services/ollamaService.js`
- **Cause:** Multiple iterations over model data, inconsistent fallback patterns
- **Improvement path:** Consolidate into single source of truth for model state

### Empty Return Pattern in Error Handling
- **Problem:** Multiple functions return empty arrays/null as error fallbacks rather than throwing or handling properly
- **Files:** Multiple files including `src/features/common/services/ollamaService.js`, `src/features/common/services/modelStateService.js`
- **Cause:** Silent failures that mask underlying issues
- **Improvement path:** Implement proper error propagation or logging when operations fail

### Large In-Memory State Management
- **Problem:** Multiple Maps and Sets maintained in memory for model state, installation progress, warmup status
- **Files:** `src/features/common/services/ollamaService.js`
- **Cause:** No persistence of state between app restarts
- **Improvement path:** Persist state to SQLite database

## Fragile Areas

### Firebase/SQLite Repository Pattern Duplication
- **Why fragile:** Each feature has parallel implementations for Firebase and SQLite (e.g., `preset/firebase.repository.js` and `preset/sqlite.repository.js`). Changes must be made in both places
- **Files:** `src/features/*/repositories/*.repository.js`
- **Safe modification:** Use the index files as abstraction layer; ensure both implementations stay in sync
- **Test coverage:** No test files detected - changes require manual testing

### Bridge Communication Layer
- **Why fragile:** Multiple bridge files (`internalBridge.js`, `windowBridge.js`, `featureBridge.js`) communicate via IPC without TypeScript validation
- **Files:** `src/bridge/*.js`
- **Safe modification:** Document any new IPC channels added; ensure both sender and receiver are updated together
- **Test coverage:** No test files detected

### Audio Processing Core
- **Why fragile:** Complex audio capture and processing logic with native dependencies
- **Files:** `src/ui/listen/audioCore/*.js`
- **Safe modification:** Changes here can break microphone input; test on multiple platforms
- **Test coverage:** No test files detected

## Scaling Limits

### SQLite as Primary Storage
- **Current capacity:** Single-user local storage
- **Limit:** Not designed for multi-user or high-concurrency scenarios
- **Scaling path:** Would need migration to PostgreSQL or similar for multi-user support

### In-Memory Session Management
- **Current capacity:** Limited by available RAM
- **Limit:** Sessions stored in memory are lost on restart
- **Scaling path:** Implement persistent session storage

## Dependencies at Risk

### node-fetch (Deprecated)
- **Risk:** Using deprecated `node-fetch` v2 (should be v3 or native fetch in Node 18+)
- **Impact:** Deprecated package may have unpatched security vulnerabilities
- **Migration plan:** Migrate to native `fetch` (Node 18+) or `fetch-api` polyfill

### Multiple Unused AI SDK Versions
- **Risk:** Package.json shows multiple AI provider SDKs with varying versions
- **Impact:** Large bundle size, potential version conflicts
- **Migration plan:** Audit and remove unused SDKs

### Keytar Optional Dependency
- **Risk:** Keytar is optional - when unavailable, security is degraded
- **Impact:** Falls back to in-memory keys
- **Migration plan:** Implement alternative secure storage or make required

## Missing Critical Features

### No Test Suite
- **Problem:** No test files detected in the codebase
- **Blocks:** Safe refactoring, regression detection, CI/CD quality gates

### No ESLint/Prettier Configuration
- **Problem:** No linting or formatting configuration detected in project root
- **Blocks:** Code consistency across contributors

### No TypeScript in Main Electron App
- **Problem:** Main Electron app uses plain JavaScript while web frontend uses TypeScript
- **Blocks:** Type safety, better IDE support, runtime error prevention

## Test Coverage Gaps

### No Test Files
- **What's not tested:** All functionality - no test files found
- **Files:** N/A
- **Risk:** Any refactoring or new feature could break existing functionality without detection
- **Priority:** High

### No Integration Tests
- **What's not tested:** Firebase integration, SQLite operations, audio capture
- **Risk:** System-level issues may only appear in production
- **Priority:** High

### No E2E Tests
- **What's not tested:** User flows, authentication, window management
- **Risk:** Critical user journeys may break without detection
- **Priority:** Medium

---

*Concerns audit: 2026-03-07*
