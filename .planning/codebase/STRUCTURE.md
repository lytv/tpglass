# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
/Users/mac/tools/tpglass/
├── src/                          # Electron main process code
│   ├── index.js                  # App entry point
│   ├── preload.js                # Preload script
│   ├── bridge/                   # IPC bridges
│   ├── window/                   # Window management
│   ├── features/                 # Feature services and repositories
│   └── ui/                       # Renderer UI components
├── pickleglass_web/              # Next.js web app
│   ├── app/                      # Next.js pages
│   ├── backend_node/             # Express API server
│   ├── components/               # React components
│   └── utils/                   # Client utilities
├── functions/                    # Firebase Cloud Functions
├── public/                       # Static assets
├── docs/                         # Documentation
├── package.json                  # Root package (Electron)
└── electron-builder.yml          # Build configuration

pickleglass_web/ structure:
pickleglass_web/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/page.tsx           # Login page
│   ├── personalize/page.tsx     # Personalization
│   ├── activity/                # Activity/history pages
│   ├── settings/               # Settings pages
│   ├── help/page.tsx
│   └── download/page.tsx
├── backend_node/                # Express backend
│   ├── index.js                # Express app factory
│   ├── middleware/auth.js      # Auth middleware
│   ├── routes/                # API routes
│   └── ipcBridge.js           # IPC bridge to main process
├── components/                 # React components
│   ├── ClientLayout.tsx
│   ├── Sidebar.tsx
│   └── SearchPopup.tsx
├── utils/                      # Client utilities
│   ├── api.ts
│   ├── auth.ts
│   ├── firebase.ts
│   └── firestore.ts
└── public/                     # Static assets
```

## Directory Purposes

**src/ - Electron Main Process:**
- Purpose: Core application logic, window management, services
- Contains: JavaScript/TypeScript modules for main process
- Key files: `src/index.js`, `src/window/windowManager.js`

**src/features/ - Feature Services:**
- Purpose: Business logic organized by feature
- Contains: Services, repositories, AI providers
- Structure:
  - `src/features/settings/` - Settings management
  - `src/features/listen/` - Audio capture and STT
  - `src/features/ask/` - LLM query handling
  - `src/features/shortcuts/` - Keyboard shortcuts
  - `src/features/common/` - Shared services

**src/features/common/services/ - Core Services:**
- Purpose: Singleton services used across features
- Contains:
  - `src/features/common/services/authService.js` - Authentication
  - `src/features/common/services/modelStateService.js` - API key management
  - `src/features/common/services/databaseInitializer.js` - SQLite setup
  - `src/features/common/services/firebaseClient.js` - Firebase initialization
  - `src/features/common/services/ollamaService.js` - Local Ollama management

**src/features/common/repositories/ - Data Access:**
- Purpose: Database abstraction with adapter pattern
- Contains: Each repository has index.js (adapter) + sqlite.repository.js + firebase.repository.js

**src/features/common/ai/ - AI Integration:**
- Purpose: Unified interface to AI providers
- Contains:
  - `src/features/common/ai/factory.js` - Provider factory
  - `src/features/common/ai/providers/` - Provider implementations

**src/window/ - Window Management:**
- Purpose: Electron BrowserWindow lifecycle
- Contains:
  - `src/window/windowManager.js` - Window creation and pool
  - `src/window/windowLayoutManager.js` - Layout calculations
  - `src/window/smoothMovementManager.js` - Animation

**src/bridge/ - IPC Communication:**
- Purpose: Inter-process communication handlers
- Contains:
  - `src/bridge/windowBridge.js` - Window-to-main communication
  - `src/bridge/featureBridge.js` - Feature-to-feature events
  - `src/bridge/internalBridge.js` - Internal event bus

**src/ui/ - Renderer UI:**
- Purpose: LitElement-based UI components
- Contains:
  - `src/ui/app/` - App shell and header components
  - `src/ui/listen/` - Listen window components
  - `src/ui/ask/` - Ask window components
  - `src/ui/settings/` - Settings window components
  - `src/ui/assets/` - Vendor libraries (LitElement, marked, highlight.js)

**pickleglass_web/ - Web Application:**
- Purpose: Next.js app for settings and activity viewing
- Contains: Full web application stack

## Key File Locations

**Entry Points:**
- `src/index.js` - Electron main process entry
- `src/preload.js` - Preload script
- `pickleglass_web/backend_node/index.js` - Express API entry
- `pickleglass_web/app/page.tsx` - Web frontend entry
- `functions/index.js` - Firebase function entry

**Configuration:**
- `package.json` - Root dependencies (Electron)
- `pickleglass_web/package.json` - Web dependencies
- `pickleglass_web/next.config.js` - Next.js config
- `electron-builder.yml` - Build configuration
- `firebase.json` - Firebase configuration
- `functions/package.json` - Cloud function dependencies

**Core Logic:**
- `src/features/listen/listenService.js` - Listen feature orchestration
- `src/features/ask/askService.js` - Ask feature orchestration
- `src/features/settings/settingsService.js` - Settings management
- `src/features/common/services/modelStateService.js` - Model/key management

**Data Layer:**
- `src/features/common/repositories/session/index.js` - Session repository
- `src/features/common/repositories/user/index.js` - User repository
- `src/features/common/repositories/preset/index.js` - Preset repository

**AI:**
- `src/features/common/ai/factory.js` - AI provider factory
- `src/features/common/ai/providers/openai.js` - OpenAI implementation

## Naming Conventions

**Files:**
- Services: `*.service.js` or `{feature}Service.js`
- Repositories: `*.repository.js` or `index.js` for adapters
- UI Components: `PascalCase.js` for LitElement components
- Providers: `{provider}.js` (e.g., `openai.js`, `gemini.js`)
- Pages: `kebab-case/page.tsx` for Next.js pages

**Directories:**
- Feature directories: `kebab-case/` (e.g., `listen/`, `ask/`)
- Repository directories: `kebab-case/` (e.g., `session/`, `user/`)
- Provider directory: `providers/`

**Variables/Functions:**
- JavaScript: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_camelCase` prefix

## Where to Add New Code

**New Feature Service:**
- Primary code: `src/features/{feature}/{feature}Service.js`
- Repositories: `src/features/{feature}/repositories/`
- UI: `src/ui/{feature}/`
- Tests: Not currently detected

**New Repository:**
- Adapter: `src/features/common/repositories/{entity}/index.js`
- SQLite impl: `src/features/common/repositories/{entity}/sqlite.repository.js`
- Firebase impl: `src/features/common/repositories/{entity}/firebase.repository.js`

**New AI Provider:**
- Implementation: `src/features/common/ai/providers/{provider}.js`
- Register in: `src/features/common/ai/factory.js` PROVIDERS object

**New Web API Route:**
- Route: `pickleglass_web/backend_node/routes/{entity}.js`
- Register in: `pickleglass_web/backend_node/index.js`

**New Web Page:**
- Page: `pickleglass_web/app/{path}/page.tsx`
- Layout: `pickleglass_web/app/layout.tsx` or `pickleglass_web/components/ClientLayout.tsx`

**New Firebase Function:**
- Implementation: `functions/index.js`
- Deploy via: Firebase CLI

## Special Directories

**node_modules/ - Dependencies:**
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

**pickleglass_web/node_modules/ - Web Dependencies:**
- Generated: Yes
- Committed: No

**public/ - Static Assets:**
- Contains: App icons, SVG assets
- Generated: No
- Committed: Yes

**functions/ - Cloud Functions:**
- Generated: No (deployed separately)
- Committed: Yes

**dist/, out/ - Build Outputs:**
- Generated: Yes (npm run build)
- Committed: No

---

*Structure analysis: 2026-03-07*
