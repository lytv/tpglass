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

        /* Row container for checkbox + message text - aligns them horizontally */
        .message-content {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 4px;
        }

        .message-content .stt-message {
            flex: 1;
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

        /* Multi-select checkbox styles */
        .transcript-checkbox {
            margin-right: 4px;
            margin-top: 3px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            accent-color: #ffc107;
        }

        .checkbox-wrapper {
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .transcription-container:hover .checkbox-wrapper,
        .transcription-container.is-hovering .checkbox-wrapper {
            opacity: 1;
        }

        .transcript-header {
            display: flex;
            justify-content: flex-end;
            padding: 8px 12px 4px 12px;
            flex-shrink: 0;
        }

        .select-all-btn {
            background: rgba(255, 193, 7, 0.2);
            border: 1px solid rgba(255, 193, 7, 0.4);
            color: #ffc107;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            line-height: 1;
            transition: all 0.2s ease;
        }

        .select-all-btn:hover {
            background: rgba(255, 193, 7, 0.3);
        }

        /* Multi-select modal styles */
        .multi-select-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
        }

        .multi-select-modal {
            background: #1e1e1e;
            border-radius: 12px;
            padding: 20px;
            max-width: 95%;
            max-height: 85%;
            width: auto;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .multi-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            color: #ffc107;
            font-weight: 500;
            flex-shrink: 0;
        }

        .selection-count {
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            font-weight: normal;
        }

        .multi-panel-container {
            display: flex;
            flex-direction: row;
            gap: 16px;
            overflow-x: auto;
            overflow-y: hidden;
            max-height: 60vh;
            padding: 8px;
            flex: 1;
        }

        .multi-panel-container::-webkit-scrollbar {
            height: 8px;
        }

        .multi-panel-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }

        .multi-panel-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }

        .multi-panel {
            flex: 0 0 auto;
            min-width: 280px;
            max-width: 350px;
            background: #2a2a2a;
            border-radius: 8px;
            padding: 16px;
            overflow-y: auto;
        }

        .multi-panel .panel-speaker {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .multi-panel .panel-original {
            font-size: 14px;
            color: #888;
            margin-bottom: 12px;
            white-space: pre-wrap;
        }

        .multi-panel .panel-translated {
            font-size: 14px;
            color: #ffc107;
            font-weight: 500;
            white-space: pre-wrap;
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
        // Custom Prompt modal state
        customPromptPresets: { type: Array, state: true },
        selectedPromptId: { type: String, state: true },
        customPromptResult: { type: String, state: true },
        customPromptLoading: { type: Boolean, state: true },
        customPromptError: { type: String, state: true },
        // Multi-select state
        selectedTranscriptIds: { type: Array, state: true },
        isHoveringList: { type: Boolean, state: true },
        multiSelectModalOpen: { type: Boolean, state: true },
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
        // Custom Prompt modal initialization
        this.customPromptPresets = [];
        this.selectedPromptId = '';
        this.customPromptResult = '';
        this.customPromptLoading = false;
        this.customPromptError = '';

        // Multi-select state initialization
        this.selectedTranscriptIds = [];
        this.isHoveringList = false;
        this.multiSelectModalOpen = false;

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
        // Clear multi-select state
        this.selectedTranscriptIds = [];
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

    // Multi-select handlers
    _toggleSelection(msgId) {
        const ids = [...this.selectedTranscriptIds];
        const idx = ids.indexOf(msgId);
        if (idx >= 0) {
            ids.splice(idx, 1);
        } else {
            ids.push(msgId);
        }
        this.selectedTranscriptIds = ids;
    }

    _toggleSelectAll() {
        const finalIds = this._getFinalMessageIds();
        if (this.selectedTranscriptIds.length === finalIds.length) {
            this.selectedTranscriptIds = [];
        } else {
            this.selectedTranscriptIds = finalIds;
        }
        this.requestUpdate();
        // Dispatch event for ListenView to update selection info
        this.dispatchEvent(new CustomEvent('selection-changed', {
            bubbles: true,
            composed: true
        }));
    }

    // Public method for ListenView to get selection state
    getSelectionInfo() {
        const finalIds = this._getFinalMessageIds();
        return {
            selectedCount: this.selectedTranscriptIds.length,
            totalCount: finalIds.length,
            isAllSelected: this.selectedTranscriptIds.length === finalIds.length && finalIds.length > 0,
            hasMessages: this.sttMessages.length > 0
        };
    }

    _getFinalMessageIds() {
        // Return ALL message IDs (including partial) - not just final ones
        return this.sttMessages.map(m => m.id);
    }

    _handleTranslationClick(msg) {
        if (this.selectedTranscriptIds.length >= 2) {
            // Multiple selected (2+) - open multi-select modal
            this.multiSelectModalOpen = true;
        } else if (this.selectedTranscriptIds.length === 1) {
            // Single selected - switch to single view
            this._switchToSingleView(msg.id);
        } else {
            // No selection - original behavior
            this.expandedTranslation = msg;
            // Reset action states when modal closes
            this._isEditing = false;
            this._editText = '';
            this._summaryContent = null;
            this._showSummaryModal = false;
            this._showCustomPromptModal = false;
        }
    }

    _closeMultiSelectModal() {
        this.multiSelectModalOpen = false;
        // Clear selection as per requirement
        this.selectedTranscriptIds = [];
    }

    _switchToSingleView(msgId) {
        const msg = this.sttMessages.find(m => m.id === msgId);
        if (msg) {
            this.multiSelectModalOpen = false;
            this.selectedTranscriptIds = [];
            this._handleTranslationClick(msg);
        }
    }

    _handleMultiSelectEdit() {
        // Edit the first selected transcript
        const firstId = this.selectedTranscriptIds[0];
        if (firstId) {
            this._switchToSingleView(firstId);
            // After switching to single view, open edit mode
            setTimeout(() => this._handleEdit(), 50);
        }
    }

    // Helper to get combined text from multiple selected transcripts
    _getCombinedText() {
        // If single transcript selected, return that text
        if (this.selectedTranscriptIds.length === 1) {
            const msgId = this.selectedTranscriptIds[0];
            const msg = this.sttMessages.find(m => m.id === msgId);
            let text = msg?.text || '';

            if (this.showTranslation && this.translations[msgId]) {
                text += `\n\nTranslation: ${this.translations[msgId]}`;
            }
            return text;
        }

        // Multiple transcripts - combine all
        return this.selectedTranscriptIds
            .map(id => {
                const msg = this.sttMessages.find(m => m.id === id);
                if (!msg) return '';

                let text = `${msg.speaker}: ${msg.text}`;
                if (this.showTranslation && this.translations[id]) {
                    text += `\n  Translation: ${this.translations[id]}`;
                }
                return text;
            })
            .filter(t => t)
            .join('\n\n---\n\n');
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
        // Determine if multi-select mode FIRST (before closing modal)
        const hasSelection = this.selectedTranscriptIds.length > 0;
        const isMultiSelect = hasSelection && this.selectedTranscriptIds.length > 1;
        const isSingleSelect = hasSelection && this.selectedTranscriptIds.length === 1;

        // Check if we have content to summarize
        if (!isMultiSelect && !isSingleSelect && !this.expandedTranslation) return;

        // Close edit panel, translation modal, and multi-select modal if open
        this._isEditing = false;
        this.expandedTranslation = null;
        this.multiSelectModalOpen = false;

        this._isSummarizing = true;
        this._showSummaryModal = true;

        try {
            let combinedText;

            if (isMultiSelect) {
                // Multi-select: combine all selected transcripts
                combinedText = this._getCombinedText();
            } else if (isSingleSelect) {
                // Single from multi-select: get that transcript's text
                const msgId = this.selectedTranscriptIds[0];
                const msg = this.sttMessages.find(m => m.id === msgId);
                let text = msg?.text || '';
                if (this.showTranslation && this.translations[msgId]) {
                    text += `\n\nTranslation: ${this.translations[msgId]}`;
                }
                combinedText = text;
            } else {
                // Original behavior: use expandedTranslation
                const originalText = this.expandedTranslation.text;
                const translatedText = this.translations[this.expandedTranslation.id] || '';
                combinedText = `${originalText}\n\nTranslation: ${translatedText}`;
            }

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

    async _handleCustomPrompt() {
        // Close edit panel, translation modal, and multi-select modal if open
        this._isEditing = false;
        this.expandedTranslation = null;
        this.multiSelectModalOpen = false;

        this._showCustomPromptModal = true;
        this.customPromptResult = '';
        this.customPromptError = '';
        this.selectedPromptId = '';
        // Load presets
        await this._loadCustomPromptPresets();
    }

    async _loadCustomPromptPresets() {
        try {
            if (window.api && window.api.settingsView) {
                const presets = await window.api.settingsView.getPresets();
                // Filter to show only custom prompts (is_default === 0)
                this.customPromptPresets = presets ? presets.filter(p => p.is_default === 0) : [];
                this.requestUpdate();
            }
        } catch (error) {
            console.error('[SttView] Error loading custom prompt presets:', error);
            this.customPromptPresets = [];
        }
    }

    getPromptById(id) {
        // Handle type mismatch: dropdown returns string, SQLite returns number
        return this.customPromptPresets.find(p => p.id == id);
    }

    async _handleRunCustomPrompt() {
        if (!this.selectedPromptId) return;

        // Determine if multi-select mode FIRST (before closing modal)
        const hasSelection = this.selectedTranscriptIds.length > 0;
        const isMultiSelect = hasSelection && this.selectedTranscriptIds.length > 1;
        const isSingleSelect = hasSelection && this.selectedTranscriptIds.length === 1;

        // Check if we have content to process
        if (!isMultiSelect && !isSingleSelect && !this.expandedTranslation) return;

        const prompt = this.getPromptById(this.selectedPromptId);
        if (!prompt) return;

        // Close edit panel, translation modal, and multi-select modal if open
        this._isEditing = false;
        this.expandedTranslation = null;
        this.multiSelectModalOpen = false;

        this.customPromptLoading = true;
        this.customPromptError = '';
        this.customPromptResult = '';
        this.requestUpdate();

        try {
            let transcriptText;

            if (isMultiSelect) {
                // Multi-select: combine all selected transcripts
                transcriptText = this._getCombinedText();
            } else if (isSingleSelect) {
                // Single from multi-select: get that transcript's text
                const msgId = this.selectedTranscriptIds[0];
                const msg = this.sttMessages.find(m => m.id === msgId);
                transcriptText = msg?.text || '';
                if (this.showTranslation && this.translations[msgId]) {
                    transcriptText += `\n\nTranslation: ${this.translations[msgId]}`;
                }
            } else {
                // Original behavior: use expandedTranslation
                transcriptText = this.expandedTranslation.text;
            }

            if (window.api && window.api.customPrompt) {
                // Replace {text} placeholder with actual transcript text
                const promptText = prompt.prompt.replace(/\{text\}/gi, transcriptText);
                const result = await window.api.customPrompt.run(promptText, transcriptText);

                if (result && result.success) {
                    this.customPromptResult = result.result || 'No result returned';
                } else {
                    this.customPromptError = result?.error || 'Failed to run prompt';
                }
            } else {
                this.customPromptError = 'Custom prompt API not available';
            }
        } catch (error) {
            console.error('[SttView] Error running custom prompt:', error);
            this.customPromptError = error.message || 'Error running prompt';
        }

        this.customPromptLoading = false;
        this.requestUpdate();
    }

    _handleSelectPrompt(e) {
        this.selectedPromptId = e.target.value;
        this.customPromptResult = '';
        this.customPromptError = '';
        this.requestUpdate();
    }

    _closeSummaryModal() {
        this._showSummaryModal = false;
        this._summaryContent = null;
    }

    _closeCustomPromptModal() {
        this._showCustomPromptModal = false;
        this.customPromptPresets = [];
        this.selectedPromptId = '';
        this.customPromptResult = '';
        this.customPromptError = '';
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
            <div class="transcription-container"
                @mouseenter="${() => this.isHoveringList = true}"
                @mouseleave="${() => this.isHoveringList = false}">
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
                            <div class="message-wrapper ${wrapperClass}" @click="${() => this._handleTranslationClick(msg)}">
                                <div class="message-content">
                                    ${this.isHoveringList ? html`
                                        <input
                                            type="checkbox"
                                            class="transcript-checkbox checkbox-wrapper"
                                            .checked="${this.selectedTranscriptIds.includes(msg.id)}"
                                            @click="${(e) => e.stopPropagation()}"
                                            @change="${() => this._toggleSelection(msg.id)}">
                                    ` : ''}
                                    <div class="stt-message ${wrapperClass}">
                                        <span class="original-text">${msg.text}</span>
                                    </div>
                                </div>
                                ${this.showTranslation && msg.isFinal ? html`
                                    ${translatedText ? html`
                                        <div class="translated-text" @click="${(e) => { e.stopPropagation(); this._handleTranslationClick(msg); }}">${translatedText}</div>
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
            ${this.multiSelectModalOpen ? html`
                <div class="multi-select-modal-overlay" @click="${() => this._closeMultiSelectModal()}">
                    <div class="multi-select-modal" @click="${(e) => e.stopPropagation()}">
                        <div class="multi-panel-header">
                            <div>
                                <span>Transcript Details</span>
                                <span class="selection-count">(${this.selectedTranscriptIds.length} selected)</span>
                            </div>
                            <div class="action-buttons">
                                <button class="action-btn" @click="${() => this._handleMultiSelectEdit()}" title="Edit First">Edit</button>
                                <button class="action-btn" @click="${() => this._handleSummarize()}" title="Summarize">Summarize</button>
                                <button class="action-btn" @click="${() => this._handleCustomPrompt()}" title="Custom Prompt">Prompt</button>
                            </div>
                            <button @click="${() => this._closeMultiSelectModal()}">Close</button>
                        </div>
                        <div class="multi-panel-container">
                            ${this.selectedTranscriptIds.map(id => {
                                const msg = this.sttMessages.find(m => m.id === id);
                                if (!msg) return '';
                                const translation = this.translations[id];
                                return html`
                                    <div class="multi-panel" @click="${(e) => { e.stopPropagation(); this._switchToSingleView(id); }}">
                                        <div class="panel-speaker">${msg.speaker}</div>
                                        <div class="panel-original">${msg.text}</div>
                                        ${translation ? html`<div class="panel-translated">${translation}</div>` : ''}
                                    </div>
                                `;
                            })}
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
                            ${this.customPromptPresets.length === 0 ? html`
                                <div class="placeholder-message">
                                    <p>No custom prompts configured.</p>
                                    <p style="margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.4);">
                                        Create prompts in Settings to enable custom AI prompts.
                                    </p>
                                </div>
                            ` : html`
                                <div class="summary-section">
                                    <h3>Select Prompt</h3>
                                    <select
                                        style="width: 100%; padding: 8px; background: #2a2a2a; border: 1px solid #444; border-radius: 6px; color: white; font-size: 13px; margin-bottom: 12px;"
                                        .value=${this.selectedPromptId}
                                        @change=${this._handleSelectPrompt}
                                    >
                                        <option value="">-- Select a prompt --</option>
                                        ${this.customPromptPresets.map(prompt => html`
                                            <option value=${prompt.id}>${prompt.title}</option>
                                        `)}
                                    </select>

                                    ${this.selectedPromptId ? html`
                                        ${this.getPromptById(this.selectedPromptId) ? html`
                                            <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 12px; color: rgba(255,255,255,0.7);">
                                                <strong>Prompt:</strong> ${this.getPromptById(this.selectedPromptId).prompt}
                                            </div>
                                        ` : ''}

                                        <button
                                            class="settings-button"
                                            style="background: #ffc107; color: #1e1e1e; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;"
                                            @click=${this._handleRunCustomPrompt}
                                            ?disabled=${this.customPromptLoading}
                                        >
                                            ${this.customPromptLoading ? 'Running...' : 'Run Prompt'}
                                        </button>
                                    ` : ''}
                                </div>

                                ${this.customPromptLoading ? html`
                                    <div class="summary-loading">Processing...</div>
                                ` : ''}

                                ${this.customPromptError ? html`
                                    <div class="summary-section" style="color: rgba(255, 59, 48, 0.9);">
                                        <h3>Error</h3>
                                        <p>${this.customPromptError}</p>
                                    </div>
                                ` : ''}

                                ${this.customPromptResult ? html`
                                    <div class="summary-section">
                                        <h3>Result</h3>
                                        <p style="white-space: pre-wrap;">${this.customPromptResult}</p>
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('stt-view', SttView); 