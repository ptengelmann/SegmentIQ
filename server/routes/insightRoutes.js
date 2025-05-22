const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/generate-summary', protect, async (req, res) => {
  console.log('[Insight Route] Generate summary request received');
  
  try {
    const { segmentData } = req.body;

    if (!segmentData || !Array.isArray(segmentData) || segmentData.length === 0) {
      return res.status(400).json({ error: 'Invalid segment data provided' });
    }

    // Generate intelligent summary based on actual data
    const size = segmentData.length;
    const sampleData = segmentData[0];
    const segmentId = sampleData?.segment;
    
    console.log(`[Insight Route] Analyzing segment ${segmentId} with ${size} customers`);
    
    // Analyze actual data structure
    const numericFields = Object.keys(sampleData).filter(key => 
      typeof sampleData[key] === 'number' && key !== 'segment'
    );
    
    const categoricalFields = Object.keys(sampleData).filter(key => 
      typeof sampleData[key] === 'string' && key !== 'segment'
    );

    // Calculate real averages from the actual segment data
    let insights = [];
    
    // Analyze numeric fields with actual values
    numericFields.slice(0, 2).forEach(field => {
      const values = segmentData
        .map(row => row[field])
        .filter(val => val !== null && val !== undefined && !isNaN(val));
      
      if (values.length > 0) {
        const avgValue = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
        const fieldName = field.replace('_', ' ').toLowerCase();
        insights.push(`average ${fieldName} of ${avgValue}`);
      }
    });

    // Analyze categorical patterns
    categoricalFields.slice(0, 1).forEach(field => {
      const values = segmentData.map(row => row[field]).filter(val => val && val !== 'null');
      if (values.length > 0) {
        // Find most common value
        const counts = {};
        values.forEach(val => counts[val] = (counts[val] || 0) + 1);
        const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        const percentage = ((counts[mostCommon] / values.length) * 100).toFixed(0);
        
        insights.push(`${percentage}% are ${mostCommon} in ${field.replace('_', ' ')}`);
      }
    });

    // Generate business-focused summary
    let summary = '';
    
    if (size < 30) {
      summary = `This premium segment contains ${size} high-value customers`;
    } else if (size < 100) {
      summary = `This focused segment includes ${size} customers with distinct characteristics`;
    } else if (size > 200) {
      summary = `This major segment represents ${size} customers forming a substantial market opportunity`;
    } else {
      summary = `This well-defined segment encompasses ${size} customers`;
    }

    // Add data-driven insights
    if (insights.length > 0) {
      summary += `, featuring ${insights.slice(0, 2).join(' and ')}`;
    }

    // Add business recommendation based on segment size
    if (size < 50) {
      summary += ". Ideal for personalized, high-touch marketing strategies and premium service offerings.";
    } else if (size > 150) {
      summary += ". Perfect for scalable marketing campaigns and broad product promotions.";
    } else {
      summary += ". Excellent for targeted campaigns and specialized product positioning.";
    }

    console.log(`[Insight Route] Generated summary: ${summary.substring(0, 100)}...`);
    res.json({ summary });

  } catch (err) {
    console.error('[Insight Route] Error:', err.message);
    res.status(500).json({ 
      summary: `This segment contains ${req.body.segmentData?.length || 0} customers with unique characteristics. Perfect for targeted marketing initiatives.`
    });
  }
});

module.exports = router;