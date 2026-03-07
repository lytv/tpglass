const express = require('express');
const router = express.Router();
const { ipcRequest } = require('../ipcBridge');

router.post('/translate', async (req, res) => {
    try {
        const { text, targetLanguage, sourceLanguage } = req.body;
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'Missing required fields: text, targetLanguage' });
        }

        const result = await ipcRequest(req, 'translation:translate', {
            text,
            targetLanguage,
            sourceLanguage
        });
        res.json(result);
    } catch (error) {
        console.error('Translation API error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/settings', async (req, res) => {
    try {
        const settings = await ipcRequest(req, 'translation:getSettings');
        res.json(settings);
    } catch (error) {
        console.error('Failed to get translation settings:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
