const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const SegmentHistory = require('../models/SegmentHistory');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { data } = req.body;
    console.log('[SEGMENT] Incoming data:', Array.isArray(data) ? data.length : typeof data);

    const response = await fetch('http://127.0.0.1:8000/predict-segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[SEGMENT] FastAPI returned non-200:', response.status, errText);
      return res.status(500).json({ error: 'FastAPI failed', details: errText });
    }

    const result = await response.json();
    console.log('[SEGMENT] Result from FastAPI:', result);

    // Save segmentation result to MongoDB
    await SegmentHistory.create({
      userId: req.user.id,
      data,
      segments: result.segments,
      summary: result.summary,
      segmentDetails: result.segment_details,
      featuresUsed: result.features_used
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('[SegmentRoute Error]', err);
    res.status(500).json({ error: 'Segmentation failed', details: err.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const history = await SegmentHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(history);
  } catch (err) {
    console.error('[Segment History Error]', err);
    res.status(500).json({ error: 'Failed to load segment history' });
  }
});

module.exports = router;
