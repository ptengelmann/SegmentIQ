// server/controllers/dashboard.js
import Profile from '../models/Profile.js';
import Segment from '../models/Segment.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'all';
    
    // Build date filter based on timeRange
    const dateFilter = {};
    const now = new Date();
    
    if (timeRange !== 'all') {
      dateFilter.createdAt = { $gte: new Date() };
      
      switch (timeRange) {
        case 'week':
          dateFilter.createdAt.$gte.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateFilter.createdAt.$gte.setDate(now.getDate() - 30);
          break;
        case 'quarter':
          dateFilter.createdAt.$gte.setDate(now.getDate() - 90);
          break;
        default:
          delete dateFilter.createdAt;
      }
    }
    
    // Run queries in parallel with Promise.all for better performance
    const [totalProfiles, totalSegments, segments, recentActivity] = await Promise.all([
      Profile.countDocuments(dateFilter),
      Segment.countDocuments(dateFilter),
      Segment.find(dateFilter).select('name previewCount createdAt').sort({ previewCount: -1 }),
      // Get recent activity across profiles and segments
      Promise.all([
        Profile.find().sort({ createdAt: -1 }).limit(5).select('createdAt data'),
        Segment.find().sort({ createdAt: -1 }).limit(5).select('name createdAt')
      ])
    ]);
    
    // Calculate profile growth rate (dummy data for demo, replace with real data in production)
    const profileGrowthRate = await calculateGrowthRate(timeRange);
    
    // Calculate segment growth rate
    const segmentGrowthRate = await calculateSegmentGrowthRate(timeRange);
    
    // Format recent activity
    const formattedActivity = formatRecentActivity(recentActivity);
    
    // Get unique fields across profiles
    const profileFields = await getProfileFields();
    
    res.json({
      totalProfiles,
      totalSegments,
      segmentStats: segments.map(seg => ({
        name: seg.name,
        count: seg.previewCount,
        created: seg.createdAt
      })),
      growthData: {
        profiles: profileGrowthRate,
        segments: segmentGrowthRate
      },
      recentActivity: formattedActivity,
      profileFields: profileFields
    });
  } catch (err) {
    console.error('[DASHBOARD ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper functions
async function calculateGrowthRate(timeRange) {
  // In a real app, you would calculate this based on historical data
  // This is a placeholder implementation
  const now = new Date();
  const previousPeriodStart = new Date();
  
  switch (timeRange) {
    case 'week':
      previousPeriodStart.setDate(now.getDate() - 14);
      break;
    case 'month':
      previousPeriodStart.setDate(now.getDate() - 60);
      break;
    case 'quarter':
      previousPeriodStart.setDate(now.getDate() - 180);
      break;
    default:
      previousPeriodStart.setDate(now.getDate() - 30);
  }
  
  // You would compare profile counts between these periods
  return 5.2; // Placeholder return value
}

async function calculateSegmentGrowthRate(timeRange) {
  // Similar to profile growth rate, but for segments
  return 8.7; // Placeholder return value
}

function formatRecentActivity([profiles, segments]) {
  const activity = [
    ...profiles.map(profile => ({
      type: 'profile',
      data: profile.data,
      timestamp: profile.createdAt,
      action: 'created'
    })),
    ...segments.map(segment => ({
      type: 'segment',
      name: segment.name,
      timestamp: segment.createdAt,
      action: 'created'
    }))
  ];
  
  // Sort by timestamp, most recent first
  return activity.sort((a, b) => b.timestamp - a.timestamp);
}

async function getProfileFields() {
  // Get a sample profile to extract fields
  const sampleProfile = await Profile.findOne();
  if (!sampleProfile || !sampleProfile.data) return [];
  
  return Object.keys(sampleProfile.data);
}