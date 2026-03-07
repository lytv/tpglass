const express = require('express');
const router = express.Router();
const { ipcRequest } = require('../ipcBridge');

router.post('/translate', async (req, res) => {
    console.log('[Translation API] POST /translate called');
    try {
        const { text, targetLanguage, sourceLanguage } = req.body;
        console.log('[Translation API] Request:', { text: text?.substring(0, 30), targetLanguage, sourceLanguage });

        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'Missing required fields: text, targetLanguage' });
        }

        const result = await ipcRequest(req, 'translation:translate', {
            text,
            targetLanguage,
            sourceLanguage
        });
        console.log('[Translation API] IPC result:', result);
        res.json(result);
    } catch (error) {
        console.error('[Translation API] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/settings', async (req, res) => {
    console.log('[Translation API] GET /settings called');
    try {
        const settings = await ipcRequest(req, 'translation:getSettings');
        console.log('[Translation API] Settings result:', settings);
        res.json(settings);
    } catch (error) {
        console.error('[Translation API] Failed to get settings:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
