# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- JavaScript - Main application logic in Electron main/renderer processes
- TypeScript - Frontend web application (Next.js) and utilities
- Python - requirements.txt present (likely for local AI services like Ollama)

**Secondary:**
- None detected

## Runtime

**Environment:**
- Node.js 20.x - Firebase Cloud Functions
- Electron 30.x - Desktop application runtime
- Browser - Web frontend runs in Chromium (Electron)

**Package Manager:**
- npm (Node.js)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Electron 30.5.1 - Cross-platform desktop application framework
- Next.js 14.2.x - React framework for web frontend

**UI:**
- React 18 - UI library
- Tailwind CSS 3.3.x - Styling framework
- Headless UI 1.7.x - Accessible UI components

**Build/Dev:**
- esbuild 0.25.x - Fast JavaScript bundler
- electron-builder 26.x - Application packaging
- Prettier 3.6.x - Code formatting

## Key Dependencies

**AI/ML Providers:**
- @anthropic-ai/sdk 0.56.x - Claude API integration
- openai 4.70.x - OpenAI API integration
- @deepgram/sdk 4.9.x - Speech-to-text
- @google/generative-ai 0.24.x - Gemini API
- portkey-ai 1.10.x - AI gateway/unified API

**Database:**
- better-sqlite3 9.6.x - Local SQLite database (embedded)
- firebase 11.10.x - Firebase client SDK
- firebase-admin 13.4.x - Firebase Admin SDK (server-side)
- firebase-functions 6.0.x - Firebase Cloud Functions

**Desktop:**
- electron-store 8.2.x - Persistent key-value storage
- electron-updater 6.6.x - Auto-update functionality
- keytar 7.9.x - System keychain access (macOS/Windows)

**Utilities:**
- axios 1.10.x - HTTP client
- express 4.18.x - Web server (backend)
- ws 8.18.x - WebSocket server
- sharp 0.34.x - Image processing
- cors 2.8.x - CORS handling
- dotenv 17.x - Environment configuration
- jsonwebtoken 9.0.x - JWT handling

## Configuration

**Environment:**
- `.env` files supported via dotenv
- Environment variables for API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
- Firebase configuration embedded in `src/features/common/services/firebaseClient.js`

**Build:**
- `electron-builder.yml` - Electron app packaging configuration
- `tsconfig.json` - TypeScript configuration (web)
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `next.config.js` - Next.js configuration

## Platform Requirements

**Development:**
- Node.js 18+
- npm
- macOS (primary), Windows (secondary)
- Python (for local Ollama support)

**Production:**
- macOS 11.0+ (Universal binary)
- Windows x64
- Firebase Cloud Functions (us-west1 region)
- Firebase Hosting for web

---

*Stack analysis: 2026-03-07*
