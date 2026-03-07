# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**AI/LLM Providers:**
- OpenAI - LLM and STT (GPT-4.1, GPT-4o-mini-transcribe)
  - SDK: `openai` npm package
  - Auth: `OPENAI_API_KEY` env var or user-provided
  - Location: `src/features/common/ai/providers/openai.js`

- Anthropic - LLM (Claude 3.5 Sonnet)
  - SDK: `@anthropic-ai/sdk` npm package
  - Auth: `ANTHROPIC_API_KEY` env var or user-provided
  - Location: `src/features/common/ai/providers/anthropic.js`

- Google Gemini - LLM and STT (Gemini 2.5 Flash)
  - SDK: `@google/generative-ai` npm package
  - Auth: `GOOGLE_API_KEY` env var or user-provided
  - Location: `src/features/common/ai/providers/gemini.js`

- Deepgram - Speech-to-text (Nova-3)
  - SDK: `@deepgram/sdk` npm package
  - Auth: `DEEPGRAM_API_KEY` env var or user-provided
  - Location: `src/features/common/ai/providers/deepgram.js`

- Ollama - Local LLM (self-hosted)
  - SDK: Native HTTP calls to local Ollama server
  - Auth: Local server URL
  - Location: `src/features/common/ai/providers/ollama.js`, `src/features/common/services/ollamaService.js`

- Whisper - Local STT (self-hosted)
  - SDK: whisper.cpp or Transformers.js
  - Auth: None (local)
  - Location: `src/features/common/ai/providers/whisper.js`, `src/features/common/services/whisperService.js`

- Portkey AI - AI gateway for unified API
  - SDK: `portkey-ai` npm package
  - Auth: `PORTKEY_API_KEY` env var

**External Web Service:**
- Vercel API (serverless-api-sf3o.vercel.app) - Virtual key management
  - Endpoint: `/api/virtual_key`
  - Auth: Firebase ID token Bearer

## Data Storage

**Databases:**
- SQLite (local)
  - Client: `better-sqlite3` npm package
  - Location: `src/features/common/services/sqliteClient.js`
  - Tables: users, sessions, transcripts, settings, permissions, prompts, provider_settings

- Firestore (cloud)
  - Database ID: `pickle-glass`
  - Client: Firebase SDK
  - Location: `src/features/common/services/firebaseClient.js`, `pickleglass_web/utils/firestore.ts`
  - Collections: users, sessions, transcripts, ai_messages, summaries, prompt_presets

**File Storage:**
- Firebase Storage (cloud)
  - Bucket: `pickle-3651a.firebasestorage.app`

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: Firebase Auth SDK with custom token flow
  - Config: `src/features/common/services/firebaseClient.js`
  - Project: `pickle-3651a`
  - Auth domain: `pickle-3651a.firebaseapp.com`

**Authentication Flow:**
1. User authenticates via web UI (`/login` page in pickleglass_web)
2. Firebase issues ID token
3. Electron app calls Firebase Cloud Function (`pickleGlassAuthCallback`)
4. Cloud Function verifies ID token and returns custom token
5. App signs in with custom token via `signInWithCustomToken`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Firebase Cloud Functions logging
- Electron app logging (console.log with custom format)
- File logging: Not detected

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting
  - Public directory: `pickleglass_web/out`
  - Config: `firebase.json`
  - Rewrite rules for SPA

**CI Pipeline:**
- GitHub Actions detected (`.github/workflows/`)
- Not fully analyzed

**Cloud Functions:**
- Firebase Cloud Functions v2
  - Region: us-west1
  - Functions: `pickleGlassAuthCallback` (authentication)

## Environment Configuration

**Required env vars:**
- `pickleglass_WEB_URL` - Web app URL for auth flow (default: http://localhost:3000)
- API keys for AI providers (user-provided or env-based):
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GOOGLE_API_KEY`
  - `DEEPGRAM_API_KEY`
  - `PORTKEY_API_KEY`

**Secrets location:**
- System keychain (via keytar) for macOS/Windows credential storage
- Electron store for app preferences

## Webhooks & Callbacks

**Incoming:**
- Firebase Auth callback (custom token exchange)
- None other detected

**Outgoing:**
- AI provider API calls (OpenAI, Anthropic, Google, Deepgram)
- Vercel API calls for virtual key management

---

*Integration audit: 2026-03-07*
