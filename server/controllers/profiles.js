// server/controllers/profiles.js - Update with enhanced logging
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const uploadProfiles = async (req, res) => {
  const startTime = Date.now();
  logger.info('📤 Starting profile upload process');
  
  try {
    const rows = req.body;
    
    // Enhanced validation logging
    if (!Array.isArray(rows) || rows.length === 0) {
      logger.warn('❌ Invalid upload data format received', {
        isArray: Array.isArray(rows),
        length: rows?.length || 0,
        dataType: typeof rows
      });
      return res.status(400).json({ error: "Invalid data format. Expected non-empty array." });
    }

    logger.info(`📊 Processing ${rows.length} profiles for upload`);
    
    // Process in batches with progress logging
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
      const batch = rows.slice(i, i + BATCH_SIZE).map(row => ({ data: row }));
      
      logger.info(`⚡ Processing batch ${currentBatch}/${totalBatches} (${batch.length} profiles)`);
      
      const created = await Profile.insertMany(batch, { ordered: false });
      insertedCount += created.length;
      
      logger.info(`✅ Batch ${currentBatch} completed - ${created.length} profiles inserted`);
    }
    
    const duration = Date.now() - startTime;
    logger.info(`🎉 Upload completed successfully`, {
      totalInserted: insertedCount,
      totalReceived: rows.length,
      skipped: rows.length - insertedCount,
      duration: `${duration}ms`,
      throughput: `${Math.round(insertedCount / (duration / 1000))} profiles/sec`
    });
    
    res.status(201).json({ 
      inserted: insertedCount,
      total: rows.length,
      skipped: rows.length - insertedCount 
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('💥 Profile upload failed', {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`
    });
    res.status(400).json({ error: err.message });
  }
};

export const getProfiles = async (req, res) => {
  const startTime = Date.now();
  logger.info('📋 Fetching profiles list', {
    query: req.query
  });
  
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc', search } = req.query;
    
    // Convert params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    logger.info(`🔍 Query parameters parsed`, {
      page: pageNum,
      limit: limitNum,
      skip,
      sortBy,
      sortDir,
      search: search || 'none'
    });
    
    // Build query
    let query = {};
    
    // Handle search across fields
    if (search) {
      query.$or = [
        { 'data.name': { $regex: search, $options: 'i' }},
        { 'data.email': { $regex: search, $options: 'i' }},
      ];
      logger.info(`🔎 Search filter applied: "${search}"`);
    }
    
    // Build sort
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    const sort = {};
    
    if (sortBy.startsWith('data.')) {
      sort[sortBy] = sortDirection;
    } else {
      sort[sortBy === 'createdAt' ? 'createdAt' : `data.${sortBy}`] = sortDirection;
    }
    
    logger.info('🔄 Executing database queries...');
    
    // Execute query with pagination
    const [profiles, totalCount] = await Promise.all([
      Profile.find(query).sort(sort).skip(skip).limit(limitNum),
      Profile.countDocuments(query)
    ]);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Profiles fetched successfully`, {
      profilesReturned: profiles.length,
      totalCount,
      duration: `${duration}ms`,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum)
    });
    
    res.json({
      profiles,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('💥 Failed to fetch profiles', {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`,
      query: req.query
    });
    res.status(500).json({ error: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  const profileId = req.params.id;
  logger.info(`🗑️ Attempting to delete profile: ${profileId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      logger.warn(`❌ Invalid profile ID format: ${profileId}`);
      return res.status(400).json({ error: "Invalid profile ID format" });
    }
    
    const result = await Profile.findByIdAndDelete(profileId);
    
    if (!result) {
      logger.warn(`❌ Profile not found for deletion: ${profileId}`);
      return res.status(404).json({ error: "Profile not found" });
    }
    
    logger.info(`✅ Profile deleted successfully: ${profileId}`, {
      deletedProfile: {
        id: result._id,
        name: result.data?.name,
        email: result.data?.email
      }
    });
    
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    logger.error(`💥 Failed to delete profile: ${profileId}`, {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};

// Add logging to other functions similarly...
export const getProfileById = async (req, res) => {
  const profileId = req.params.id;
  logger.info(`👤 Fetching profile details: ${profileId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      logger.warn(`❌ Invalid profile ID format: ${profileId}`);
      return res.status(400).json({ error: "Invalid profile ID format" });
    }
    
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      logger.warn(`❌ Profile not found: ${profileId}`);
      return res.status(404).json({ error: "Profile not found" });
    }
    
    logger.info(`✅ Profile details fetched: ${profileId}`, {
      profile: {
        id: profile._id,
        name: profile.data?.name,
        email: profile.data?.email
      }
    });
    
    res.json(profile);
  } catch (err) {
    logger.error(`💥 Failed to fetch profile: ${profileId}`, {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};

// ADD THIS NEW FUNCTION:
export const updateProfile = async (req, res) => {
  const profileId = req.params.id;
  logger.info(`✏️ Attempting to update profile: ${profileId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      logger.warn(`❌ Invalid profile ID format: ${profileId}`);
      return res.status(400).json({ error: "Invalid profile ID format" });
    }
    
    const { data } = req.body;
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      { data, lastActivity: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedProfile) {
      logger.warn(`❌ Profile not found for update: ${profileId}`);
      return res.status(404).json({ error: "Profile not found" });
    }
    
    logger.info(`✅ Profile updated successfully: ${profileId}`, {
      updatedFields: Object.keys(data)
    });
    
    res.json(updatedProfile);
  } catch (err) {
    logger.error(`💥 Failed to update profile: ${profileId}`, {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};

export const getProfileFields = async (req, res) => {
  logger.info('🔍 Fetching available profile fields');
  
  try {
    const profiles = await Profile.find().limit(10);
    const fieldsSet = new Set();
    
    profiles.forEach(profile => {
      if (profile.data) {
        Object.keys(profile.data).forEach(field => fieldsSet.add(field));
      }
    });
    
    const fields = Array.from(fieldsSet);
    
    logger.info(`✅ Profile fields extracted`, {
      fieldsFound: fields.length,
      fields: fields
    });
    
    res.json(fields);
  } catch (err) {
    logger.error('💥 Failed to fetch profile fields', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
};