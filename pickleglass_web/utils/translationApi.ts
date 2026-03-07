// Translation API client for frontend

export interface TranslationSettings {
  enabled: boolean;
  language: string;
}

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  error: string | null;
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
    if (!window.api?.translation) {
      console.warn('Translation API not available');
      return { success: false, translatedText: text, error: 'Translation API not available' };
    }

    try {
      return await window.api.translation.translate(text, targetLanguage, sourceLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      return { success: false, translatedText: text, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Get current translation settings
   */
  getSettings: async (): Promise<TranslationSettings | null> => {
    if (!window.api?.translation) {
      console.warn('Translation API not available');
      return null;
    }

    try {
      return await window.api.translation.getSettings();
    } catch (error) {
      console.error('Failed to get translation settings:', error);
      return null;
    }
  },

  /**
   * Listen for translation settings changes
   */
  onSettingsUpdated: (callback: (settings: TranslationSettings) => void): (() => void) => {
    if (!window.api?.translation) {
      console.warn('Translation API not available');
      return () => {};
    }

    const handler = (_event: Electron.IpcRendererEvent, settings: TranslationSettings) => {
      callback(settings);
    };

    window.api.translation.onTranslationSettingsUpdated(handler);

    // Return cleanup function
    return () => {
      window.api.translation.removeOnTranslationSettingsUpdated(handler);
    };
  }
};
