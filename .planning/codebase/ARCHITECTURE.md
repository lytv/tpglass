# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Multi-window Electron app with layered service architecture and dual-backend system

**Key Characteristics:**
- Electron main process manages multiple floating windows (header, listen, ask, settings)
- Dual-data layer pattern: SQLite for local storage, Firebase Firestore for cloud sync
- Repository adapter pattern switches between local/cloud based on authentication state
- AI provider factory pattern supporting multiple LLM and STT backends
- Event-driven communication via internal IPC bridge between windows
- Embedded Express server serves both API and web frontend

## Layers

**Main Process Layer:**
- Purpose: Electron application entry point, window management, system integration
- Location: `src/index.js`
- Contains: App lifecycle, IPC handlers, service initialization, protocol handling
- Depends on: All feature services, window manager, database
- Used by: Electron runtime

**Window Manager Layer:**
- Purpose: Multi-window creation and lifecycle management
- Location: `src/window/windowManager.js`
- Contains: BrowserWindow creation, window pool management, layout calculations
- Depends on: WindowLayoutManager, SmoothMovementManager
- Used by: Main process, InternalBridge

**Feature Services Layer:**
- Purpose: Business logic orchestration for core features
- Location: `src/features/*/`
- Contains:
  - `src/features/listen/listenService.js` - Audio capture and speech-to-text
  - `src/features/ask/askService.js` - LLM interactions with screenshot context
  - `src/features/settings/settingsService.js` - User preferences and API keys
  - `src/features/shortcuts/shortcutsService.js` - Keyboard shortcuts
- Depends on: Repositories, AI providers, window manager
- Used by: IPC handlers, UI layer

**Repository Layer:**
- Purpose: Data access abstraction with local/cloud switching
- Location: `src/features/common/repositories/`
- Contains: Adapter pattern with SQLite and Firebase implementations
- Examples:
  - `src/features/common/repositories/session/index.js` - Session CRUD
  - `src/features/common/repositories/user/index.js` - User profile
  - `src/features/common/repositories/preset/index.js` - User presets
- Depends on: SQLite client, Firebase client, Auth service
- Used by: Feature services

**AI Providers Layer:**
- Purpose: Unified interface to multiple AI services
- Location: `src/features/common/ai/providers/`
- Contains:
  - `src/features/common/ai/factory.js` - Provider factory
  - `src/features/common/ai/providers/openai.js`
  - `src/features/common/ai/providers/anthropic.js`
  - `src/features/common/ai/providers/gemini.js`
  - `src/features/common/ai/providers/deepgram.js`
  - `src/features/common/ai/providers/ollama.js`
  - `src/features/common/ai/providers/whisper.js`
- Depends on: Provider SDKs (openai, anthropic-ai, google-generative-ai, etc.)
- Used by: Feature services

**UI Renderer Layer:**
- Purpose: Web-based UI rendered in Electron windows
- Location: `src/ui/`
- Contains: LitElement-based components
- Examples:
  - `src/ui/app/PickleGlassApp.js` - Main app shell
  - `src/ui/listen/ListenView.js` - Audio listening UI
  - `src/ui/ask/AskView.js` - Ask assistant UI
  - `src/ui/settings/SettingsView.js` - Settings UI
- Depends on: LitElement, internal bridge for IPC
- Used by: Window manager (loaded in BrowserWindows)

**Web Backend Layer:**
- Purpose: Express API server serving web frontend requests
- Location: `pickleglass_web/backend_node/`
- Contains:
  - `pickleglass_web/backend_node/index.js` - Express app
  - `pickleglass_web/backend_node/routes/auth.js`
  - `pickleglass_web/backend_node/routes/user.js`
  - `pickleglass_web/backend_node/routes/conversations.js`
  - `pickleglass_web/backend_node/routes/presets.js`
- Depends on: Express, EventBridge for IPC to main process
- Used by: Web frontend, embedded via Express in main process

**Web Frontend Layer:**
- Purpose: Next.js application for web-based settings and activity
- Location: `pickleglass_web/`
- Contains: Next.js pages and components
- Used by: Embedded Express static server in main process

**Firebase Cloud Functions Layer:**
- Purpose: Serverless backend for auth token exchange
- Location: `functions/`
- Contains: `functions/index.js` with pickleGlassAuthCallback
- Depends on: Firebase Admin SDK
- Used by: Mobile/web auth flow

## Data Flow

**App Startup Flow:**

1. `src/index.js` app.whenReady() triggers
2. Initialize Firebase client
3. Initialize SQLite database via databaseInitializer
4. Initialize Auth service (creates default local user)
5. Initialize ModelStateService
6. Start embedded Express servers (API + frontend)
7. Create windows via createWindows()
8. Register protocol handler for deep links

**Listen Session Flow:**

1. User clicks Listen button in header
2. IPC message sent to main process
3. listenService.handleListenRequest() called
4. Creates/retrieves session via sessionRepository
5. Initializes STT service with selected provider
6. Audio captured via macOS loopback or desktopCapturer
7. Real-time transcription via STT provider
8. Transcripts saved to database
9. Summary service receives conversation turns for analysis

**Ask Query Flow:**

1. User sends message in Ask window
2. askService.sendMessage() triggered
3. Captures screenshot via screencapture command
4. Gets current model from modelStateService
5. Builds prompt with system prompt + conversation history
6. Creates streaming LLM via AI factory
7. Streams response to Ask window via IPC
8. Saves user message and AI response to database

**Cloud Sync Flow:**

1. User logs in via Firebase auth
2. authService.signInWithCustomToken() called
3. Repository adapter switches to Firebase implementations
4. Future queries use firebaseRepository instead of sqliteRepository

## Key Abstractions

**Session Repository:**
- Purpose: Represents a conversation session (listen or ask)
- Examples: `src/features/common/repositories/session/index.js`
- Pattern: Adapter switching between sqliteRepository and firebaseRepository based on auth state

**Model State Service:**
- Purpose: Centralized API key and model selection management
- Location: `src/features/common/services/modelStateService.js`
- Pattern: Singleton with getProviderConfig, getAllApiKeys, getSelectedModels

**Event Bridge:**
- Purpose: IPC communication between main process and embedded API server
- Location: Created in `src/index.js` as EventEmitter
- Pattern: Events passed through Express middleware to main process handlers

**Window Notification Manager:**
- Purpose: Smart notification routing to relevant windows
- Location: `src/features/settings/settingsService.js`
- Pattern: Debounced broadcasts to specific window types

## Entry Points

**Main Electron Entry:**
- Location: `src/index.js`
- Triggers: Electron app ready event
- Responsibilities: Service initialization, window creation, IPC setup, protocol handling

**Window Manager Entry:**
- Location: `src/window/windowManager.js`
- Triggers: Called from main process after services initialized
- Responsibilities: Create BrowserWindows for header, listen, ask, settings, main

**Embedded API Server Entry:**
- Location: `pickleglass_web/backend_node/index.js`
- Triggers: Called from startWebStack() in main process
- Responsibilities: Express app with auth middleware, routes for user/conversations/presets

**Web Frontend Entry:**
- Location: `pickleglass_web/app/page.tsx`
- Triggers: Loaded by embedded Express static server
- Responsibilities: Next.js page rendering

**Firebase Function Entry:**
- Location: `functions/index.js`
- Triggers: HTTPS request to pickleGlassAuthCallback
- Responsibilities: Token verification and custom token generation

## Error Handling

**Strategy:** Try-catch with error logging, graceful degradation, user-facing error messages

**Patterns:**
- Service methods return `{ success: boolean, error?: string }` objects
- Database errors caught and logged, app continues with fallback behavior
- API key validation errors broadcast to relevant windows
- Stream errors handled with fallback to text-only requests in AskService

## Cross-Cutting Concerns

**Logging:** Console.log with structured prefixes (e.g., `[ListenService]`, `[AskService]`)

**Validation:** API key validation via provider SDKs, parameter validation in services

**Authentication:** Firebase Auth with custom token exchange, local SQLite fallback for anonymous users

**Configuration:** electron-store for local settings, environment variables for ports

---

*Architecture analysis: 2026-03-07*
