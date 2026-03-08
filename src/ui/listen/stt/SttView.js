import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SttView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        /* Inherit font styles from parent */

        .transcription-container {
            overflow-y: auto;
            padding: 12px 12px 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 150px;
            max-height: 600px;
            position: relative;
            z-index: 1;
            flex: 1;
        }

        /* Visibility handled by parent component */

        .transcription-container::-webkit-scrollbar {
            width: 8px;
        }
        .transcription-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }
        .transcription-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }
        .transcription-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        .stt-message {
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            word-break: break-word;
            line-height: 1.5;
            font-size: 13px;
            margin-bottom: 4px;
            box-sizing: border-box;
        }

        .stt-message.them {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            margin-right: auto;
        }

        .stt-message.me {
            background: rgba(0, 122, 255, 0.8);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            margin-left: auto;
        }

        .message-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 80%;
        }

        .message-wrapper.them {
            align-self: flex-start;
            margin-right: auto;
        }

        .message-wrapper.me {
            align-self: flex-end;
            margin-left: auto;
        }

        .original-text {
            word-wrap: break-word;
            word-break: break-word;
        }

        .translated-text {
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 8px;
            background: rgba(255, 193, 7, 0.2);
            color: rgba(255, 193, 7, 0.9);
            font-style: italic;
        }

        .message-wrapper.them .translated-text {
            align-self: flex-start;
        }

        .message-wrapper.me .translated-text {
            align-self: flex-end;
        }

        .translation-loading {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
        }

        .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-style: italic;
        }
    `;

    static properties = {
        sttMessages: { type: Array },
        isVisible: { type: Boolean },
        showTranslation: { type: Boolean },
        translationLanguage: { type: String },
        translations: { type: Object, state: true },
    };

    constructor() {
        super();
        this.sttMessages = [];
        this.isVisible = true;
        this.showTranslation = false;
        this.translationLanguage = 'en';
        this.translations = {};
        this.messageIdCounter = 0;
        this._shouldScrollAfterUpdate = false;
        this._translationCache = new Map();
        this._pendingTranslations = new Set();

        this.handleSttUpdate = this.handleSttUpdate.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        if (window.api) {
            window.api.sttView.onSttUpdate(this.handleSttUpdate);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.api) {
            window.api.sttView.removeOnSttUpdate(this.handleSttUpdate);
        }
    }

    // Handle session reset from parent
    resetTranscript() {
        this.sttMessages = [];
        this.translations = {};
        this._translationCache.clear();
        this._pendingTranslations.clear();
        this.requestUpdate();
    }

    handleSttUpdate(event, { speaker, text, isFinal, isPartial }) {
        if (text === undefined) return;

        const container = this.shadowRoot.querySelector('.transcription-container');
        this._shouldScrollAfterUpdate = container ? container.scrollTop + container.clientHeight >= container.scrollHeight - 10 : false;

        // Find ANY message (partial OR final) for this speaker - not just partials
        const findLastMessageIdx = spk => {
            for (let i = this.sttMessages.length - 1; i >= 0; i--) {
                const m = this.sttMessages[i];
                if (m.speaker === spk) return i;
            }
            return -1;
        };

        const newMessages = [...this.sttMessages];
        const targetIdx = findLastMessageIdx(speaker);

        if (isPartial) {
            if (targetIdx !== -1) {
                newMessages[targetIdx] = {
                    ...newMessages[targetIdx],
                    text,
                    isPartial: true,
                    isFinal: false,
                };
            } else {
                newMessages.push({
                    id: this.messageIdCounter++,
                    speaker,
                    text,
                    isPartial: true,
                    isFinal: false,
                });
            }
        } else if (isFinal) {
            if (targetIdx !== -1) {
                // Merge with existing message instead of creating duplicate
                const existingMsg = newMessages[targetIdx];
                // If existing message has different text, append with space to merge
                const mergedText = existingMsg.text !== text
                    ? `${existingMsg.text} ${text}`.trim()
                    : text;
                newMessages[targetIdx] = {
                    ...existingMsg,
                    text: mergedText,
                    isPartial: false,
                    isFinal: true,
                };
            } else {
                newMessages.push({
                    id: this.messageIdCounter++,
                    speaker,
                    text,
                    isPartial: false,
                    isFinal: true,
                });
            }
        }

        this.sttMessages = newMessages;
        
        // Notify parent component about message updates
        this.dispatchEvent(new CustomEvent('stt-messages-updated', {
            detail: { messages: this.sttMessages },
            bubbles: true
        }));
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = this.shadowRoot.querySelector('.transcription-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 0);
    }

    getSpeakerClass(speaker) {
        return speaker.toLowerCase() === 'me' ? 'me' : 'them';
    }

    getTranscriptText() {
        return this.sttMessages.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
    }

    async translateMessage(text, messageId) {
        if (!text || !this.translationLanguage) return null;

        // Check cache first
        const cacheKey = `${text}_${this.translationLanguage}`;
        if (this._translationCache.has(cacheKey)) {
            const cachedText = this._translationCache.get(cacheKey);
            this.translations = { ...this.translations, [messageId]: cachedText };
            return cachedText;
        }

        // Check if already pending
        if (this._pendingTranslations.has(messageId)) {
            return null;
        }

        // Skip very short texts
        if (text.length < 3) {
            return null;
        }

        this._pendingTranslations.add(messageId);

        try {
            const result = await window.api.translation.translate(
                text,
                this.translationLanguage,
                'auto'
            );

            this._translationCache.set(cacheKey, result.translatedText);
            this._pendingTranslations.delete(messageId);
            this.translations = { ...this.translations, [messageId]: result.translatedText };
            this.requestUpdate();

            return result.translatedText;
        } catch (error) {
            console.error('[SttView] Translation error:', error);
            this._pendingTranslations.delete(messageId);
            return null;
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('sttMessages')) {
            if (this._shouldScrollAfterUpdate) {
                this.scrollToBottom();
                this._shouldScrollAfterUpdate = false;
            }
            // Trigger translations for new final messages
            if (this.showTranslation) {
                this.triggerTranslations();
            }
        }

        if (changedProperties.has('showTranslation') && this.showTranslation) {
            this.triggerTranslations();
        }
    }

    triggerTranslations() {
        if (!this.translationLanguage) return;

        const finalMessages = this.sttMessages.filter(msg => msg.isFinal);
        finalMessages.forEach(msg => {
            const cacheKey = `${msg.text}_${this.translationLanguage}`;
            if (!this._translationCache.has(cacheKey) && !this._pendingTranslations.has(msg.id)) {
                this.translateMessage(msg.text, msg.id);
            }
        });
    }

    render() {
        if (!this.isVisible) {
            return html`<div style="display: none;"></div>`;
        }

        return html`
            <div class="transcription-container">
                ${this.sttMessages.length === 0
                    ? html`<div class="empty-state">Waiting for speech...</div>`
                    : this.sttMessages.map(msg => {
                        const wrapperClass = this.getSpeakerClass(msg.speaker);
                        const translatedText = this.translations[msg.id];
                        const isPending = this._pendingTranslations.has(msg.id);

                        return html`
                            <div class="message-wrapper ${wrapperClass}">
                                <div class="stt-message ${wrapperClass}">
                                    <span class="original-text">${msg.text}</span>
                                </div>
                                ${this.showTranslation && msg.isFinal ? html`
                                    ${translatedText ? html`
                                        <div class="translated-text">${translatedText}</div>
                                    ` : isPending ? html`
                                        <div class="translation-loading">Translating...</div>
                                    ` : ''}
                                ` : ''}
                            </div>
                        `;
                    })
                }
            </div>
        `;
    }
}

customElements.define('stt-view', SttView); 