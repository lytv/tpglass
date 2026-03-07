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
    console.log('Translation API called:', { text: text?.substring(0, 50), targetLanguage, sourceLanguage });

    if (!window.api?.translation) {
      console.warn('Translation API not available - window.api:', window.api);
      return { success: false, translatedText: text, error: 'Translation API not available' };
    }

    try {
      const result = await window.api.translation.translate(text, targetLanguage, sourceLanguage);
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
    if (!window.api?.translation) {
      console.warn('Translation API not available');
      console.log('window.api:', window.api);
      return null;
    }

    try {
      const settings = await window.api.translation.getSettings();
      console.log('Translation settings loaded:', settings);
      return settings;
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
