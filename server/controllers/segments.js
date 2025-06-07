// server/controllers/segments.js
import Segment from '../models/Segment.js';
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';

export const createSegment = async (req, res) => {
  try {
    const { name, filters } = req.body;
    
    // Validate input
    if (!name || !filters || !Array.isArray(filters) || filters.length === 0) {
      return res.status(400).json({ error: 'Invalid segment data. Name and at least one filter are required.' });
    }
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(filters);
    
    // Find matching profiles (limited to first 100 for preview)
    const matchedProfiles = await Profile.find(mongoQuery).limit(100);
    
    // Count total matches (may be more than what we return)
    const totalMatches = await Profile.countDocuments(mongoQuery);
    
    // Create and save segment
    const segment = new Segment({
      name,
      filters,
      previewCount: totalMatches,
    });
    
    await segment.save();
    
    console.log(`[SEGMENT] '${name}' created with ${totalMatches} matches`);
    res.status(201).json({ 
      segment, 
      matchedProfiles,
      totalMatches,
      limitedResults: totalMatches > matchedProfiles.length 
    });
  } catch (err) {
    console.error('[SEGMENT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSegments = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    
    // Convert params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortDirection;
    
    // Execute query with pagination
    const [segments, totalCount] = await Promise.all([
      Segment.find().sort(sort).skip(skip).limit(limitNum),
      Segment.countDocuments()
    ]);
    
    res.json({
      segments,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err) {
    console.error('[SEGMENTS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSegmentById = async (req, res) => {
  try {
    const segmentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(segment.filters);
    
    // Get sample profiles with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [profiles, totalCount] = await Promise.all([
      Profile.find(mongoQuery).skip(skip).limit(limit),
      Profile.countDocuments(mongoQuery)
    ]);
    
    res.json({
      segment,
      profiles,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('[SEGMENT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateSegment = async (req, res) => {
  try {
    const segmentId = req.params.id;
    const { name, filters } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    // Validate input
    if (!name || !filters || !Array.isArray(filters)) {
      return res.status(400).json({ error: 'Invalid segment data. Name and filters are required.' });
    }
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(filters);
    
    // Count total matches
    const totalMatches = await Profile.countDocuments(mongoQuery);
    
    // Update segment
    const updatedSegment = await Segment.findByIdAndUpdate(
      segmentId,
      { 
        name, 
        filters, 
        previewCount: totalMatches,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedSegment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    console.log(`[SEGMENT] '${name}' updated with ${totalMatches} matches`);
    res.json({ segment: updatedSegment, matchCount: totalMatches });
  } catch (err) {
    console.error('[SEGMENT UPDATE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSegment = async (req, res) => {
  try {
    const segmentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    const result = await Segment.findByIdAndDelete(segmentId);
    
    if (!result) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    res.json({ message: 'Segment deleted successfully' });
  } catch (err) {
    console.error('[SEGMENT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to build MongoDB query from filters
function buildMongoQuery(filters) {
  const mongoQuery = {};
  
  filters.forEach(({ field, operator, value }) => {
    // Skip incomplete filters
    if (!field || !value) return;
    
    if (!mongoQuery[`data.${field}`]) mongoQuery[`data.${field}`] = {};
    
    // Parse numeric values if appropriate
    let parsedValue = value;
    if (!isNaN(value) && operator !== '=' && !isNaN(parseFloat(value))) {
      parsedValue = parseFloat(value);
    }
    
    // Handle different operators
    switch (operator) {
      case '=':
        mongoQuery[`data.${field}`]['$eq'] = parsedValue;
        break;
      case '>':
        mongoQuery[`data.${field}`]['$gt'] = parsedValue;
        break;
      case '<':
        mongoQuery[`data.${field}`]['$lt'] = parsedValue;
        break;
      case 'contains':
        mongoQuery[`data.${field}`]['$regex'] = parsedValue;
        mongoQuery[`data.${field}`]['$options'] = 'i'; // case insensitive
        break;
      case 'starts_with':
        mongoQuery[`data.${field}`]['$regex'] = `^${parsedValue}`;
        mongoQuery[`data.${field}`]['$options'] = 'i';
        break;
      case 'ends_with':
        mongoQuery[`data.${field}`]['$regex'] = `${parsedValue}$`;
        mongoQuery[`data.${field}`]['$options'] = 'i';
        break;
      default:
        mongoQuery[`data.${field}`]['$eq'] = parsedValue;
    }
  });
  
  return mongoQuery;
}