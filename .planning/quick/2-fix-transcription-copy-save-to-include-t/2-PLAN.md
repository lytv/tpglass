---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js
autonomous: true
requirements: []
---

<objective>
Include translated content in transcript copy/save operations when translation is enabled.

Purpose: Users who enable translation should have translated text included when they copy or save transcripts.
Output: Modified getTranscriptText() method in SttView.js
</objective>

<context>
@/Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js

**Current implementation (lines 254-256):**
```javascript
getTranscriptText() {
    return this.sttMessages.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
}
```

**Relevant context from 2-CONTEXT.md:**
- Format: Original text on its own line, translation on separate line below
- Example format:
  ```
  Speaker: Hello world
    Translation: Bonjour le monde
  ```
- Skip messages without translations - only show original text for those
- Auto-save format: Use same format as copy/save
</context>

<tasks>

<task type="auto">
  <name>Task 1: Modify getTranscriptText() to include translations</name>
  <files>/Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js</files>
  <action>
Modify the getTranscriptText() method (around line 254) to:

1. Check if this.showTranslation is enabled
2. For each message, build the text as: `${msg.speaker}: ${msg.text}`
3. If showTranslation is true AND this.translations[msg.id] exists, append a new line with `  Translation: ${this.translations[msg.id]}`
4. Join all lines with '\n'

The final output format should be:
```
Speaker: Hello world
  Translation: Bonjour le monde
Speaker: How are you?
```

For messages without translations (when showTranslation is on), just show the original line without translation.
  </action>
  <verify>
<automated>grep -A 15 "getTranscriptText()" /Users/mac/tools/tpglass/src/ui/listen/stt/SttView.js | head -20</automated>
  </verify>
  <done>
getTranscriptText() includes translation lines when showTranslation is true and translation exists. Auto-save and manual save/copy will both use this method and include translations.
  </done>
</task>

</tasks>

<verification>
[Overall task verification]
- getTranscriptText() is called by ListenView.handleSave() (line 661)
- getTranscriptText() is called by ListenView.autoSaveTranscript() (line 712)
- Both copy and save will now include translations when enabled
</verification>

<success_criteria>
Modified getTranscriptText() method returns transcript text with translations appended on separate lines when showTranslation is enabled and translation exists.
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-transcription-copy-save-to-include-t/2-SUMMARY.md`
</output>
