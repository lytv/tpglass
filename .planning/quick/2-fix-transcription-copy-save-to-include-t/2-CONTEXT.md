# Quick Task 2: Fix Transcription Copy/Save to Include Translated Content - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Task Boundary

Fix Transcription Copy/Save to Include Translated Content

</domain>

<decisions>
## Implementation Decisions

### Translation Format
- Separate lines format: Original text on its own line, translation on a separate line below
- Example:
  ```
  Speaker: Hello world
    Translation: Bonjour le monde
  ```

### Missing Translations
- Skip messages without translations - only show original text for those

### Claude's Discretion
- Auto-save format: Use same format as copy/save
- File naming conventions: No change needed

</decisions>

<specifics>
## Specific Ideas

- Modify getTranscriptText() in SttView.js to include translations when showTranslation is enabled
- Check this.translations[msg.id] exists before adding translation line

</specifics>
