// server/controllers/segments.js
import Segment from '../models/Segment.js';
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const createSegment = async (req, res) => {
  const startTime = Date.now();
  logger.info('🎯 Starting segment creation process');
  
  try {
    const { name, filters } = req.body;
    
    // Enhanced validation logging
    if (!name || !filters || !Array.isArray(filters) || filters.length === 0) {
      logger.warn('❌ Invalid segment data received', {
        hasName: !!name,
        hasFilters: !!filters,
        isArray: Array.isArray(filters),
        filterCount: filters?.length || 0
      });
      return res.status(400).json({ error: 'Invalid segment data. Name and at least one filter are required.' });
    }
    
    logger.info(`📊 Creating segment "${name}" with ${filters.length} filters`, {
      segmentName: name,
      filters: filters.map(f => ({ field: f.field, operator: f.operator }))
    });
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(filters);
    logger.info('🔍 MongoDB query built', { query: mongoQuery });
    
    // Find matching profiles (limited to first 100 for preview)
    logger.info('⚡ Executing profile matching queries...');
    const [matchedProfiles, totalMatches] = await Promise.all([
      Profile.find(mongoQuery).limit(100),
      Profile.countDocuments(mongoQuery)
    ]);
    
    logger.info(`✅ Profile matching completed`, {
      totalMatches,
      previewProfiles: matchedProfiles.length,
      limitedResults: totalMatches > matchedProfiles.length
    });
    
    // Create and save segment
    const segment = new Segment({
      name,
      filters,
      previewCount: totalMatches,
    });
    
    await segment.save();
    
    const duration = Date.now() - startTime;
    logger.info(`🎉 Segment created successfully`, {
      segmentId: segment._id,
      segmentName: name,
      totalMatches,
      duration: `${duration}ms`
    });
    
    res.status(201).json({ 
      segment, 
      matchedProfiles,
      totalMatches,
      limitedResults: totalMatches > matchedProfiles.length 
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('💥 Segment creation failed', {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ error: err.message });
  }
};

// ADD THIS NEW PREVIEW FUNCTION
export const previewSegment = async (req, res) => {
  const startTime = Date.now();
  logger.info('👁️ Starting segment preview');
  
  try {
    const { filters } = req.body;
    
    // Enhanced validation logging
    if (!filters || !Array.isArray(filters) || filters.length === 0) {
      logger.warn('❌ Invalid preview data received', {
        hasFilters: !!filters,
        isArray: Array.isArray(filters),
        filterCount: filters?.length || 0
      });
      return res.status(400).json({ error: 'Invalid filter data. At least one filter is required.' });
    }
    
    logger.info(`🔍 Previewing segment with ${filters.length} filters`, {
      filters: filters.map(f => ({ field: f.field, operator: f.operator, hasValue: !!f.value }))
    });
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(filters);
    logger.info('🔍 MongoDB query built for preview', { query: mongoQuery });
    
    // Find matching profiles (limited to first 50 for preview)
    logger.info('⚡ Executing preview profile matching queries...');
    const [matchedProfiles, totalMatches] = await Promise.all([
      Profile.find(mongoQuery).limit(50), // Smaller limit for preview
      Profile.countDocuments(mongoQuery)
    ]);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Preview completed successfully`, {
      totalMatches,
      previewProfiles: matchedProfiles.length,
      limitedResults: totalMatches > matchedProfiles.length,
      duration: `${duration}ms`
    });
    
    res.json({ 
      matchedProfiles,
      totalMatches,
      limitedResults: totalMatches > matchedProfiles.length,
      preview: true // Flag to indicate this is a preview
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('💥 Segment preview failed', {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ error: err.message });
  }
};

export const getSegments = async (req, res) => {
  const startTime = Date.now();
  logger.info('📋 Fetching segments list', {
    query: req.query
  });
  
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    
    // Convert params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    logger.info(`🔍 Query parameters parsed`, {
      page: pageNum,
      limit: limitNum,
      skip,
      sortBy,
      sortDir
    });
    
    // Build sort
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortDirection;
    
    logger.info('🔄 Executing database queries...');
    
    // Execute query with pagination
    const [segments, totalCount] = await Promise.all([
      Segment.find().sort(sort).skip(skip).limit(limitNum),
      Segment.countDocuments()
    ]);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Segments fetched successfully`, {
      segmentsReturned: segments.length,
      totalCount,
      duration: `${duration}ms`,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum)
    });
    
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
    const duration = Date.now() - startTime;
    logger.error('💥 Failed to fetch segments', {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`,
      query: req.query
    });
    res.status(500).json({ error: err.message });
  }
};

export const getSegmentById = async (req, res) => {
  const segmentId = req.params.id;
  const startTime = Date.now();
  logger.info(`🎯 Fetching segment details: ${segmentId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      logger.warn(`❌ Invalid segment ID format: ${segmentId}`);
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    const segment = await Segment.findById(segmentId);
    
    if (!segment) {
      logger.warn(`❌ Segment not found: ${segmentId}`);
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    logger.info(`📊 Segment found: "${segment.name}", building profile query...`);
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(segment.filters);
    
    // Get sample profiles with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    logger.info(`⚡ Fetching profiles for segment`, {
      page,
      limit,
      skip,
      filterCount: segment.filters.length
    });
    
    const [profiles, totalCount] = await Promise.all([
      Profile.find(mongoQuery).skip(skip).limit(limit),
      Profile.countDocuments(mongoQuery)
    ]);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Segment details fetched successfully`, {
      segmentId,
      segmentName: segment.name,
      profilesReturned: profiles.length,
      totalProfiles: totalCount,
      duration: `${duration}ms`
    });
    
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
    const duration = Date.now() - startTime;
    logger.error(`💥 Failed to fetch segment: ${segmentId}`, {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ error: err.message });
  }
};

export const updateSegment = async (req, res) => {
  const segmentId = req.params.id;
  const startTime = Date.now();
  logger.info(`✏️ Attempting to update segment: ${segmentId}`);
  
  try {
    const { name, filters } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      logger.warn(`❌ Invalid segment ID format: ${segmentId}`);
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    // Validate input
    if (!name || !filters || !Array.isArray(filters)) {
      logger.warn(`❌ Invalid update data for segment: ${segmentId}`, {
        hasName: !!name,
        hasFilters: !!filters,
        isArray: Array.isArray(filters)
      });
      return res.status(400).json({ error: 'Invalid segment data. Name and filters are required.' });
    }
    
    logger.info(`📊 Updating segment "${name}" with ${filters.length} filters`);
    
    // Convert filters to MongoDB query
    const mongoQuery = buildMongoQuery(filters);
    
    // Count total matches
    logger.info('⚡ Recalculating profile matches...');
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
      logger.warn(`❌ Segment not found for update: ${segmentId}`);
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Segment updated successfully: ${segmentId}`, {
      segmentName: name,
      newMatchCount: totalMatches,
      duration: `${duration}ms`
    });
    
    res.json({ segment: updatedSegment, matchCount: totalMatches });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error(`💥 Failed to update segment: ${segmentId}`, {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ error: err.message });
  }
};

export const deleteSegment = async (req, res) => {
  const segmentId = req.params.id;
  logger.info(`🗑️ Attempting to delete segment: ${segmentId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(segmentId)) {
      logger.warn(`❌ Invalid segment ID format: ${segmentId}`);
      return res.status(400).json({ error: "Invalid segment ID format" });
    }
    
    const result = await Segment.findByIdAndDelete(segmentId);
    
    if (!result) {
      logger.warn(`❌ Segment not found for deletion: ${segmentId}`);
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    logger.info(`✅ Segment deleted successfully: ${segmentId}`, {
      deletedSegment: {
        id: result._id,
        name: result.name,
        profileCount: result.previewCount
      }
    });
    
    res.json({ message: 'Segment deleted successfully' });
  } catch (err) {
    logger.error(`💥 Failed to delete segment: ${segmentId}`, {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};

// Enhanced helper function with logging
function buildMongoQuery(filters) {
  logger.info('🔧 Building MongoDB query from filters', {
    filterCount: filters.length,
    filters: filters.map(f => ({ field: f.field, operator: f.operator, hasValue: !!f.value }))
  });
  
  const mongoQuery = {};
  let appliedFilters = 0;
  
  filters.forEach(({ field, operator, value }, index) => {
    // Skip incomplete filters
    if (!field || !value) {
      logger.warn(`⚠️ Skipping incomplete filter at index ${index}`, { field, operator, hasValue: !!value });
      return;
    }
    
    if (!mongoQuery[`data.${field}`]) mongoQuery[`data.${field}`] = {};
    
    // Parse numeric values if appropriate
    let parsedValue = value;
    if (!isNaN(value) && operator !== '=' && !isNaN(parseFloat(value))) {
      parsedValue = parseFloat(value);
      logger.info(`🔢 Parsed numeric value for ${field}: ${value} -> ${parsedValue}`);
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
    
    appliedFilters++;
  });
  
  logger.info(`✅ MongoDB query built successfully`, {
    appliedFilters,
    totalFilters: filters.length,
    queryFields: Object.keys(mongoQuery)
  });
  
  return mongoQuery;
}