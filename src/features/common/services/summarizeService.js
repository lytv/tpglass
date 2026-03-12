const { createLLM } = require('../ai/factory');
const modelStateService = require('./modelStateService');
const settingsService = require('../../settings/settingsService');

/**
 * SummarizeService - Backend service for generating summaries from transcript text
 * Uses LLM to provide TLDR, bullet points, and action items
 */
class SummarizeService {
    constructor() {
        this.defaultModel = 'gpt-4o-mini';
    }

    /**
     * Generate a summary from transcript text
     * @param {string} originalText - The original transcript text
     * @param {string} translatedText - The translated text (if available)
     * @returns {Promise<{success: boolean, tldr: string, bulletPoints: string[], actionItems: string[], error: string|null}>}
     */
    async summarize({ originalText, translatedText }) {
        if (!originalText || !originalText.trim()) {
            return {
                success: false,
                tldr: '',
                bulletPoints: [],
                actionItems: [],
                error: 'No text provided for summarization'
            };
        }

        try {
            // Get user's translation language from settings
            const translationSettings = await settingsService.getTranslationSettings();
            const targetLanguage = translationSettings.language || 'en';

            // Get API key and model info
            const modelInfo = await modelStateService.getCurrentModelInfo('llm');
            if (!modelInfo || !modelInfo.apiKey) {
                const error = 'API key not configured';
                console.warn(`[SummarizeService] ${error}`);
                return {
                    success: false,
                    tldr: '',
                    bulletPoints: [],
                    actionItems: [],
                    error
                };
            }

            // Build prompt for summary
            const prompt = this._buildSummaryPrompt(originalText, translatedText, targetLanguage);

            console.log(`[SummarizeService] Summarizing via ${modelInfo.provider} using ${modelInfo.model}`);

            const llm = createLLM(modelInfo.provider, {
                apiKey: modelInfo.apiKey,
                model: modelInfo.model,
                temperature: 0.5,
                maxTokens: 2048,
            });

            const messages = [
                { role: 'system', content: 'You are a helpful assistant that summarizes transcripts. Provide clear, concise summaries in the requested format.' },
                { role: 'user', content: prompt }
            ];

            const completion = await llm.chat(messages);
            const response = completion.content;

            // Parse the response into structured format
            const parsed = this._parseSummaryResponse(response);

            console.log(`[SummarizeService] Summary generated successfully`);

            return {
                success: true,
                tldr: parsed.tldr,
                bulletPoints: parsed.bulletPoints,
                actionItems: parsed.actionItems,
                error: null
            };

        } catch (error) {
            console.error(`[SummarizeService] Summary error:`, error.message);
            return {
                success: false,
                tldr: '',
                bulletPoints: [],
                actionItems: [],
                error: error.message
            };
        }
    }

    /**
     * Execute a custom prompt against transcript text
     * @param {string} prompt - The custom prompt to execute
     * @param {string} transcriptText - The transcript text to process
     * @returns {Promise<{success: boolean, result: string, error: string|null}>}
     */
    async runCustomPrompt({ prompt, transcriptText }) {
        if (!transcriptText || !transcriptText.trim()) {
            return { success: false, error: 'No transcript text provided' };
        }
        if (!prompt || !prompt.trim()) {
            return { success: false, error: 'No prompt provided' };
        }

        try {
            // Get API key and model info
            const modelInfo = await modelStateService.getCurrentModelInfo('llm');
            if (!modelInfo || !modelInfo.apiKey) {
                const error = 'API key not configured';
                console.warn(`[SummarizeService] ${error}`);
                return { success: false, error };
            }

            console.log(`[SummarizeService] Running custom prompt via ${modelInfo.provider} using ${modelInfo.model}`);

            const llm = createLLM(modelInfo.provider, {
                apiKey: modelInfo.apiKey,
                model: modelInfo.model,
                temperature: 0.5,
                maxTokens: 2048,
            });

            const messages = [
                { role: 'system', content: 'You are a helpful assistant that analyzes transcripts.' },
                { role: 'user', content: `${prompt}\n\nTranscript:\n${transcriptText}` }
            ];

            const completion = await llm.chat(messages);
            return { success: true, result: completion.content };

        } catch (error) {
            console.error(`[SummarizeService] Custom prompt error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Build the summary prompt
     * @param {string} originalText - Original transcript
     * @param {string} translatedText - Translated text
     * @param {string} targetLanguage - Target language code (e.g., 'en', 'ja', 'vi')
     * @returns {string} - Formatted prompt
     */
    _buildSummaryPrompt(originalText, translatedText, targetLanguage) {
        let prompt = `Analyze the following transcript and provide a summary in ${targetLanguage.toUpperCase()} language in this exact format:

1. TLDR: [1-2 sentence summary]
2. KEY POINTS:
- [Point 1]
- [Point 2]
- [Point 3]
- [Point 4]
- [Point 5]
3. ACTION ITEMS:
- [Action item 1 or "None"]
- [Action item 2 or "None"]

`;

        if (translatedText && translatedText.trim()) {
            prompt += `Original Transcript:\n${originalText}\n\nTranslation:\n${translatedText}`;
        } else {
            prompt += `Transcript:\n${originalText}`;
        }

        return prompt;
    }

    /**
     * Parse LLM response into structured format
     * @param {string} response - Raw LLM response
     * @returns {object} - Parsed summary
     */
    _parseSummaryResponse(response) {
        const result = {
            tldr: '',
            bulletPoints: [],
            actionItems: []
        };

        const lines = response.split('\n').map(line => line.trim()).filter(line => line);

        let currentSection = null;
        const bulletPoints = [];
        const actionItems = [];

        for (const line of lines) {
            // Detect section headers
            if (line.toLowerCase().startsWith('tldr:') || line.toLowerCase().includes('summary')) {
                currentSection = 'tldr';
                result.tldr = line.replace(/^(tldr:|summary:)\s*/i, '').trim();
                continue;
            }

            if (line.toLowerCase().startsWith('key points:') || line.toLowerCase().startsWith('key points')) {
                currentSection = 'bulletPoints';
                continue;
            }

            if (line.toLowerCase().startsWith('action items:') || line.toLowerCase().startsWith('action items')) {
                currentSection = 'actionItems';
                continue;
            }

            // Parse bullet points
            if (currentSection === 'bulletPoints' && (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
                const point = line.replace(/^[-*\d.]+\s*/, '').trim();
                if (point && !point.toLowerCase().includes('none')) {
                    bulletPoints.push(point);
                }
            }

            // Parse action items
            if (currentSection === 'actionItems' && (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
                const item = line.replace(/^[-*\d.]+\s*/, '').trim();
                if (item && !item.toLowerCase().includes('none')) {
                    actionItems.push(item);
                }
            }
        }

        // If parsing didn't work well, try fallback
        if (bulletPoints.length === 0 && actionItems.length === 0) {
            // Try to extract any useful content from the response
            const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
            if (sentences.length > 0) {
                result.tldr = sentences[0].trim();
                result.bulletPoints = sentences.slice(1, 6).map(s => s.trim());
            }
        } else {
            result.bulletPoints = bulletPoints;
            result.actionItems = actionItems;
        }

        return result;
    }
}

module.exports = new SummarizeService();
