// server/controllers/profiles.js
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';

export const uploadProfiles = async (req, res) => {
  try {
    const rows = req.body;
    
    // Validation
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Invalid data format. Expected non-empty array." });
    }
    
    // Process in batches for better performance with large datasets
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map(row => ({ data: row }));
      const created = await Profile.insertMany(batch, { ordered: false });
      insertedCount += created.length;
    }
    
    console.log(`[UPLOAD] ${insertedCount} profiles inserted at ${new Date().toISOString()}`);
    
    res.status(201).json({ 
      inserted: insertedCount,
      total: rows.length,
      skipped: rows.length - insertedCount 
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
};

export const getProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc', search } = req.query;
    
    // Convert params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    let query = {};
    
    // Handle search across fields
    if (search) {
      // Create text search across all fields in the data object
      query.$or = [
        { 'data.name': { $regex: search, $options: 'i' }},
        { 'data.email': { $regex: search, $options: 'i' }},
        // Add other common fields you want to search
      ];
    }
    
    // Build sort
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    const sort = {};
    
    // Handle sorting by nested fields
    if (sortBy.startsWith('data.')) {
      sort[sortBy] = sortDirection;
    } else {
      // Default sort by createdAt if not a data field
      sort[sortBy === 'createdAt' ? 'createdAt' : `data.${sortBy}`] = sortDirection;
    }
    
    // Execute query with pagination
    const [profiles, totalCount] = await Promise.all([
      Profile.find(query).sort(sort).skip(skip).limit(limitNum),
      Profile.countDocuments(query)
    ]);
    
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
    console.error('[PROFILES ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new endpoint to get available fields
export const getProfileFields = async (req, res) => {
  try {
    // Sample up to 10 profiles to find all possible fields
    const profiles = await Profile.find().limit(10);
    
    // Extract unique fields from all profiles
    const fieldsSet = new Set();
    
    profiles.forEach(profile => {
      if (profile.data) {
        Object.keys(profile.data).forEach(field => fieldsSet.add(field));
      }
    });
    
    const fields = Array.from(fieldsSet);
    
    res.json(fields);
  } catch (err) {
    console.error('[FIELDS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

// Get profile by ID
export const getProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: "Invalid profile ID format" });
    }
    
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    res.json(profile);
  } catch (err) {
    console.error('[PROFILE DETAIL ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: "Invalid profile ID format" });
    }
    
    const result = await Profile.findByIdAndDelete(profileId);
    
    if (!result) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error('[PROFILE DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};