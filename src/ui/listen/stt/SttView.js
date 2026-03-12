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
            font-size: 14px;
            padding: 6px 10px;
            border-radius: 8px;
            background: rgba(255, 193, 7, 0.2);
            color: rgba(255, 193, 7, 0.95);
            font-style: italic;
            cursor: pointer;
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

        .translation-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .translation-modal {
            background: #1e1e1e;
            border-radius: 12px;
            padding: 20px;
            max-width: 90%;
            max-height: 80%;
            overflow: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            color: #ffc107;
            font-weight: 500;
        }

        .modal-header button {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 18px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
        }

        .modal-header button:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }

        .modal-content .original {
            font-size: 14px;
            color: #888;
            margin-bottom: 12px;
        }

        .modal-content .translated {
            font-size: 18px;
            color: #ffc107;
            font-weight: 500;
        }

        /* Action buttons in modal header */
        .action-buttons {
            display: flex;
            gap: 4px;
            margin-right: 8px;
        }

        .action-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }

        /* Edit mode */
        .edit-textarea {
            width: 100%;
            min-height: 100px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            padding: 12px;
            font-family: inherit;
            resize: vertical;
            box-sizing: border-box;
        }

        .edit-textarea:focus {
            outline: none;
            border-color: #ffc107;
        }

        .edit-controls {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            justify-content: flex-end;
        }

        .edit-controls button {
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
        }

        .edit-controls .save-btn {
            background: #ffc107;
            color: #1e1e1e;
        }

        .edit-controls .save-btn:hover {
            background: #ffcd38;
        }

        .edit-controls .cancel-btn {
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .edit-controls .cancel-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }

        /* Summary/Custom Prompt modal */
        .summary-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
        }

        .summary-modal {
            background: #1e1e1e;
            border-radius: 12px;
            padding: 20px;
            max-width: 600px;
            max-height: 80%;
            overflow: auto;
            width: 90%;
        }

        .summary-section {
            margin-bottom: 16px;
        }

        .summary-section h3 {
            font-size: 14px;
            color: #ffc107;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .summary-section p, .summary-section ul {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
        }

        .summary-section ul {
            padding-left: 20px;
        }

        .summary-section li {
            margin-bottom: 4px;
        }

        .summary-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }

        .placeholder-message {
            text-align: center;
            padding: 40px 20px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }

        .modal-close-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 18px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
        }

        .modal-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
    `;

    static properties = {
        sttMessages: { type: Array },
        isVisible: { type: Boolean },
        showTranslation: { type: Boolean },
        translationLanguage: { type: String },
        translationSettingsLoaded: { type: Boolean },
        translations: { type: Object, state: true },
        expandedTranslation: { type: Object, state: true },
        // Action button states
        _isEditing: { type: Boolean, state: true },
        _editText: { type: String, state: true },
        _isSummarizing: { type: Boolean, state: true },
        _summaryContent: { type: Object, state: true },
        _showSummaryModal: { type: Boolean, state: true },
        _showCustomPromptModal: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.sttMessages = [];
        this.isVisible = true;
        this.showTranslation = false;
        this.translationLanguage = 'en';
        this.translationSettingsLoaded = false;
        this.translations = {};
        this.expandedTranslation = null;
        this.messageIdCounter = 0;
        this._shouldScrollAfterUpdate = false;
        this._translationCache = new Map();
        this._pendingTranslations = new Set();

        // Action button states
        this._isEditing = false;
        this._editText = '';
        this._isSummarizing = false;
        this._summaryContent = null;
        this._showSummaryModal = false;
        this._showCustomPromptModal = false;

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
        this.expandedTranslation = null;
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

        // Always create a new message with a new unique ID to prevent ID collision
        // This ensures each transcript gets its own translation
        const newMessageId = crypto.randomUUID();

        if (isPartial) {
            if (targetIdx !== -1) {
                const existingMsg = newMessages[targetIdx];
                // Only update in-place if it's from the same "session" (continuous speech)
                // Otherwise create a new message
                const isContinuousUpdate = existingMsg.isPartial && !existingMsg.isFinal;

                if (isContinuousUpdate) {
                    // Update existing partial message - keep same ID for continuous speech
                    newMessages[targetIdx] = {
                        ...newMessages[targetIdx],
                        text,
                        isPartial: true,
                        isFinal: false,
                    };
                } else {
                    // Not continuous - create new message with new ID
                    newMessages.push({
                        id: newMessageId,
                        speaker,
                        text,
                        isPartial: true,
                        isFinal: false,
                    });
                }
            } else {
                newMessages.push({
                    id: newMessageId,
                    speaker,
                    text,
                    isPartial: true,
                    isFinal: false,
                });
            }
        } else if (isFinal) {
            // Handle final message: merge with previous final, replace previous partial
            if (targetIdx !== -1) {
                const existingMsg = newMessages[targetIdx];
                if (existingMsg.isFinal && !existingMsg.isPartial) {
                    // Previous message is final - merge with it
                    const mergedText = `${existingMsg.text} ${text}`.trim();
                    const oldMessageId = existingMsg.id;

                    // Clear old translations - they are for old text, not merged text
                    // The merged text needs its own translation
                    const { [oldMessageId]: _, ...remainingTranslations } = this.translations;
                    this.translations = remainingTranslations;

                    newMessages[targetIdx] = {
                        ...existingMsg,
                        id: newMessageId,  // Use the new ID created at the beginning
                        text: mergedText,
                        isPartial: false,
                        isFinal: true,
                    };

                    // Note: Translation for merged text will be triggered via updated() -> triggerTranslations()
                    // after the messages array is updated
                } else if (existingMsg.isPartial) {
                    // Previous message is partial - replace it with final (discard partial text)
                    const oldMessageId = existingMsg.id;

                    // Clear old translations - the partial had different text
                    const { [oldMessageId]: _, ...remainingTranslations } = this.translations;
                    this.translations = remainingTranslations;

                    newMessages[targetIdx] = {
                        ...existingMsg,
                        id: newMessageId,
                        text: text,  // Use the new final text, not merged
                        isPartial: false,
                        isFinal: true,
                    };
                } else {
                    // No existing message or other case - create new message
                    newMessages.push({
                        id: newMessageId,
                        speaker,
                        text,
                        isPartial: false,
                        isFinal: true,
                    });
                }
            } else {
                newMessages.push({
                    id: newMessageId,
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

    _handleTranslationClick(msg) {
        this.expandedTranslation = msg;
        // Reset action states when modal closes
        this._isEditing = false;
        this._editText = '';
        this._summaryContent = null;
        this._showSummaryModal = false;
        this._showCustomPromptModal = false;
    }

    // Action button handlers
    _handleEdit() {
        this._isEditing = true;
        this._editText = this.expandedTranslation ? this.expandedTranslation.text : '';
    }

    _handleSaveEdit() {
        if (this.expandedTranslation) {
            // Update the message text in sttMessages array
            const messageId = this.expandedTranslation.id;
            const newMessages = this.sttMessages.map(msg => {
                if (msg.id === messageId) {
                    return { ...msg, text: this._editText };
                }
                return msg;
            });
            this.sttMessages = newMessages;

            // Update expanded translation to reflect changes
            this.expandedTranslation = { ...this.expandedTranslation, text: this._editText };

            // Dispatch event to notify parent
            this.dispatchEvent(new CustomEvent('stt-messages-updated', {
                detail: { messages: this.sttMessages },
                bubbles: true
            }));
        }
        this._isEditing = false;
    }

    _handleCancelEdit() {
        this._editText = this.expandedTranslation ? this.expandedTranslation.text : '';
        this._isEditing = false;
    }

    async _handleSummarize() {
        if (!this.expandedTranslation) return;

        this._isSummarizing = true;
        this._showSummaryModal = true;

        try {
            const originalText = this.expandedTranslation.text;
            const translatedText = this.translations[this.expandedTranslation.id] || '';

            // Get both original and translated text
            const combinedText = `${originalText}\n\nTranslation: ${translatedText}`;

            // Call summarize API via IPC
            if (window.api && window.api.summarize) {
                const result = await window.api.summarize.summarize(combinedText);
                this._summaryContent = result;
            } else {
                // Fallback placeholder if API not available
                this._summaryContent = {
                    tldr: 'Summary feature requires backend API integration.',
                    bulletPoints: ['API endpoint not configured'],
                    actionItems: ['Configure summarize API in backend']
                };
            }
        } catch (error) {
            console.error('[SttView] Summarize error:', error);
            this._summaryContent = {
                tldr: 'Error generating summary',
                bulletPoints: [error.message],
                actionItems: []
            };
        }

        this._isSummarizing = false;
    }

    _handleCustomPrompt() {
        this._showCustomPromptModal = true;
    }

    _closeSummaryModal() {
        this._showSummaryModal = false;
        this._summaryContent = null;
    }

    _closeCustomPromptModal() {
        this._showCustomPromptModal = false;
    }

    getTranscriptText() {
        return this.sttMessages.map(msg => {
            let text = `${msg.speaker}: ${msg.text}`;
            // Include translation if enabled and translation exists for this message
            if (this.showTranslation && this.translations[msg.id]) {
                text += `\n  Translation: ${this.translations[msg.id]}`;
            }
            return text;
        }).join('\n');
    }

    async translateMessage(text, messageId) {
        if (!text || !this.translationLanguage) return null;

        // Check cache first
        const cacheKey = `${text}_${this.translationLanguage}`;
        if (this._translationCache.has(cacheKey)) {
            const cachedText = this._translationCache.get(cacheKey);
            this.translations = { ...this.translations, [messageId]: cachedText };
            this.requestUpdate();
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

        console.log(`[SttView] Requesting translation for messageId=${messageId}, text="${text.substring(0, 50)}..."`);

        try {
            const result = await window.api.translation.translate(
                text,
                this.translationLanguage,
                'auto'
            );

            console.log(`[SttView] Translation response for messageId=${messageId}: "${result.translatedText ? result.translatedText.substring(0, 50) : 'EMPTY'}"`);

            // Check if translation was successful
            if (!result.success) {
                console.warn(`[SttView] Translation failed: ${result.error}`);
                this._pendingTranslations.delete(messageId);
                // Still store the original text to indicate translation was attempted but failed
                this.translations = { ...this.translations, [messageId]: `[Translation unavailable: ${result.error}]` };
                this.requestUpdate();
                return null;
            }

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

        // Fix race condition: when translation settings finish loading and showTranslation is enabled,
        // trigger translations for any messages that arrived before settings loaded
        if (changedProperties.has('translationSettingsLoaded') && this.translationSettingsLoaded) {
            if (this.showTranslation && this.sttMessages.length > 0) {
                console.log('[SttView] Translation settings loaded, triggering translations for existing messages');
                this.triggerTranslations();
            }
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

                        // Debug logging
                        if (msg.id <= 3) {
                            console.log(`[SttView] Render: msg.id=${msg.id}, isFinal=${msg.isFinal}, showTranslation=${this.showTranslation}, hasTranslation=${!!translatedText}, text="${msg.text.substring(0, 30)}..."`);
                        }

                        return html`
                            <div class="message-wrapper ${wrapperClass}">
                                <div class="stt-message ${wrapperClass}">
                                    <span class="original-text">${msg.text}</span>
                                </div>
                                ${this.showTranslation && msg.isFinal ? html`
                                    ${translatedText ? html`
                                        <div class="translated-text" @click="${() => this._handleTranslationClick(msg)}">${translatedText}</div>
                                    ` : isPending ? html`
                                        <div class="translation-loading">Translating...</div>
                                    ` : ''}
                                ` : ''}
                            </div>
                        `;
                    })
                }
            </div>
            ${this.expandedTranslation ? html`
                <div class="translation-modal-overlay" @click="${() => this.expandedTranslation = null}">
                    <div class="translation-modal" @click="${(e) => e.stopPropagation()}">
                        <div class="modal-header">
                            <div class="action-buttons">
                                <button class="action-btn" @click="${() => this._handleEdit()}" title="Edit Transcript">✏️</button>
                                <button class="action-btn" @click="${() => this._handleSummarize()}" title="Summarize">📝</button>
                                <button class="action-btn" @click="${() => this._handleCustomPrompt()}" title="Custom Prompt">⚡</button>
                            </div>
                            <button @click="${() => this.expandedTranslation = null}">✕</button>
                        </div>
                        <div class="modal-content">
                            ${this._isEditing ? html`
                                <textarea
                                    class="edit-textarea"
                                    .value="${this._editText}"
                                    @input="${(e) => this._editText = e.target.value}"
                                ></textarea>
                                <div class="edit-controls">
                                    <button class="cancel-btn" @click="${() => this._handleCancelEdit()}">Cancel</button>
                                    <button class="save-btn" @click="${() => this._handleSaveEdit()}">Save</button>
                                </div>
                            ` : html`
                                <p class="original">${this.expandedTranslation.text}</p>
                                <p class="translated">${this.translations[this.expandedTranslation.id]}</p>
                            `}
                        </div>
                    </div>
                </div>
            ` : ''}
            ${this._showSummaryModal ? html`
                <div class="summary-modal-overlay" @click="${() => this._closeSummaryModal()}">
                    <div class="summary-modal" @click="${(e) => e.stopPropagation()}">
                        <div class="modal-header">
                            <span>Summary</span>
                            <button class="modal-close-btn" @click="${() => this._closeSummaryModal()}">✕</button>
                        </div>
                        <div class="modal-content">
                            ${this._isSummarizing ? html`
                                <div class="summary-loading">Generating summary...</div>
                            ` : this._summaryContent ? html`
                                <div class="summary-section">
                                    <h3>TL;DR</h3>
                                    <p>${this._summaryContent.tldr}</p>
                                </div>
                                <div class="summary-section">
                                    <h3>Key Points</h3>
                                    <ul>
                                        ${this._summaryContent.bulletPoints.map(point => html`<li>${point}</li>`)}
                                    </ul>
                                </div>
                                ${this._summaryContent.actionItems && this._summaryContent.actionItems.length > 0 ? html`
                                    <div class="summary-section">
                                        <h3>Action Items</h3>
                                        <ul>
                                            ${this._summaryContent.actionItems.map(item => html`<li>${item}</li>`)}
                                        </ul>
                                    </div>
                                ` : ''}
                            ` : ''}
                        </div>
                    </div>
                </div>
            ` : ''}
            ${this._showCustomPromptModal ? html`
                <div class="summary-modal-overlay" @click="${() => this._closeCustomPromptModal()}">
                    <div class="summary-modal" @click="${(e) => e.stopPropagation()}">
                        <div class="modal-header">
                            <span>Custom Prompt</span>
                            <button class="modal-close-btn" @click="${() => this._closeCustomPromptModal()}">✕</button>
                        </div>
                        <div class="modal-content">
                            <div class="placeholder-message">
                                <p>Configure prompts in Settings to enable custom AI prompts.</p>
                                <p style="margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.4);">
                                    (This feature will be available in a future phase)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('stt-view', SttView); 