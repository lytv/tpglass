// Translation API client for frontend - uses HTTP API

export interface TranslationSettings {
  enabled: boolean;
  language: string;
}

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  error: string | null;
}

// Helper to get API URL
async function getApiUrl(): Promise<string> {
  try {
    const response = await fetch('/runtime-config.json');
    if (response.ok) {
      const config = await response.json();
      return config.API_URL;
    }
  } catch (error) {
    console.log('Failed to load runtime config, using fallback');
  }
  // Fallback - the API is on the same port but different path
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:50990';
}

export const translationApi = {
  /**
   * Translate text to target language
   */
  translate: async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> => {
    console.log('Translation API called:', { text: text?.substring(0, 50), targetLanguage, sourceLanguage });

    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/api/translation/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Translation API error:', error);
        return { success: false, translatedText: text, error };
      }

      const result = await response.json();
      console.log('Translation result:', result);
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return { success: false, translatedText: text, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Get current translation settings
   */
  getSettings: async (): Promise<TranslationSettings | null> => {
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/api/translation/settings`);
      if (!response.ok) {
        console.error('Failed to get translation settings:', response.statusText);
        return null;
      }
      const settings = await response.json();
      console.log('Translation settings loaded:', settings);
      return settings;
    } catch (error) {
      console.error('Failed to get translation settings:', error);
      return null;
    }
  },

  /**
   * Listen for translation settings changes - not implemented via HTTP
   * This would require WebSocket or polling
   */
  onSettingsUpdated: (callback: (settings: TranslationSettings) => void): (() => void) => {
    console.warn('Settings update listener not implemented for HTTP API - use polling instead');
    // Return no-op cleanup
    return () => {};
  }
};
