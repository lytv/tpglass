const crypto = require('crypto');
const { createLLM } = require('../ai/factory');
const modelStateService = require('./modelStateService');

class TranslationService {
    constructor() {
        this.cache = new Map();
        this.defaultModel = 'gpt-4o-mini';
    }

    /**
     * Generate a cache key for a translation request.
     * @param {string} text - The text to translate
     * @param {string} targetLanguage - Target language code (e.g., 'en', 'ko', 'es')
     * @param {string|null} sourceLanguage - Source language code, or null for auto-detect
     * @returns {string} - SHA-256 hash key
     */
    _generateCacheKey(text, targetLanguage, sourceLanguage) {
        const normalizedText = text.trim().replace(/\s+/g, ' ');
        const source = sourceLanguage || 'auto';
        const keyString = `${source}:${targetLanguage}:${normalizedText}`;
        return crypto.createHash('sha256').update(keyString).digest('hex');
    }

    /**
     * Translate text from source language to target language.
     * @param {string} text - The text to translate
     * @param {string} targetLanguage - Target language code (e.g., 'en', 'ko', 'es')
     * @param {string|null} sourceLanguage - Source language code, or null for auto-detect
     * @returns {Promise<{success: boolean, translatedText: string, error: string|null}>}
     */
    async translate(text, targetLanguage, sourceLanguage = null) {
        if (!text || !text.trim()) {
            return { success: true, translatedText: '', error: null };
        }

        const cacheKey = this._generateCacheKey(text, targetLanguage, sourceLanguage);

        // Check cache first
        if (this.cache.has(cacheKey)) {
            console.log(`[TranslationService] Cache hit for key: ${cacheKey.substring(0, 8)}...`);
            return this.cache.get(cacheKey);
        }

        try {
            // Get API key and model info
            const modelInfo = await modelStateService.getCurrentModelInfo('llm');
            if (!modelInfo || !modelInfo.apiKey) {
                const error = 'API key not configured';
                console.warn(`[TranslationService] ${error}`);
                const result = { success: false, translatedText: text, error };
                this.cache.set(cacheKey, result);
                return result;
            }

            // Build system prompt based on whether source is specified
            let systemPrompt;
            if (sourceLanguage) {
                systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Respond with ONLY the translation, no explanations.`;
            } else {
                systemPrompt = `Detect the source language and translate to ${targetLanguage}. Respond with ONLY the translation. If source is unclear, respond with original text.`;
            }

            console.log(`[TranslationService] Translating via ${modelInfo.provider} using ${modelInfo.model}`);

            const llm = createLLM(modelInfo.provider, {
                apiKey: modelInfo.apiKey,
                model: modelInfo.model,
                temperature: 0.3,
                maxTokens: 4096,
            });

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ];

            const completion = await llm.chat(messages);
            const translatedText = completion.content;

            console.log(`[TranslationService] Translation successful: "${text.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);

            const result = { success: true, translatedText, error: null };
            this.cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error(`[TranslationService] Translation error:`, error.message);
            const result = { success: false, translatedText: text, error: error.message };
            this.cache.set(cacheKey, result);
            return result;
        }
    }

    /**
     * Clear the translation cache.
     */
    clearCache() {
        this.cache.clear();
        console.log('[TranslationService] Cache cleared');
    }
}

module.exports = new TranslationService();
