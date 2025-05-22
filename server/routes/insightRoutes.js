const express = require('express');
const OpenAI = require('openai');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate-summary', protect, async (req, res) => {
  console.log('[Insight Route] Generate summary request received');
  console.log('[Insight Route] Request body:', req.body);
  
  try {
    const { segmentData } = req.body;

    if (!segmentData || !Array.isArray(segmentData) || segmentData.length === 0) {
      console.log('[Insight Route] Invalid segment data');
      return res.status(400).json({ error: 'Invalid segment data provided' });
    }

    const prompt = `
      Analyze the following customer segment and summarize the common traits in 2-3 sentences.
      Focus on identifying patterns in the data that define this customer group.
      
      Segment Data (${segmentData.length} customers):
      ${JSON.stringify(segmentData.slice(0, 5), null, 2)}
    `;

    console.log('[Insight Route] Sending request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ✅ Changed from gpt-4 to gpt-3.5-turbo
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });

    const summary = response.choices[0].message.content;
    console.log('[Insight Route] OpenAI response:', summary);
    
    res.json({ summary });

  } catch (err) {
    console.error('[Insight Route] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate summary', details: err.message });
  }
});

module.exports = router;