---
status: investigating
trigger: 'When using Deepgram (or OpenAI/Whisper) for transcription, previously transcribed content is erased or only latest content is displayed'
created: 2026-03-09T00:00:00.000Z
updated: 2026-03-09T00:00:00.000Z
---

## Current Focus

hypothesis: "Searching codebase for transcription state management"
test: "Search for Deepgram, Whisper, transcription related code"
expecting: "Find where transcription content is stored and displayed"
next_action: "Understand how transcription state is managed"

## Symptoms

expected: "All transcribed content should persist and be displayed"
actual: "Previously transcribed content is erased or only latest content shows"
reproduction: "Use Deepgram/OpenAI/Whisper for transcription, wait for multiple transcriptions"
started: "Unknown when this started"

## Evidence
