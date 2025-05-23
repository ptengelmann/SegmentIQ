// server/models/SegmentHistory.js
const mongoose = require('mongoose');

const SegmentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 🆕 Enhanced data tracking
  originalData: { type: Array, required: true }, // Original uploaded data
  processedData: { type: Array, required: true }, // Cleaned data used for clustering
  
  // 🆕 Clustering configuration
  clusteringConfig: {
    algorithm: { type: String, default: 'kmeans' },
    numberOfClusters: { type: Number, required: true },
    selectedFeatures: [{ type: String }], // Which columns were used
    isAutoMode: { type: Boolean, default: true },
    scalingMethod: { type: String, default: 'standard' }
  },
  
  // Results
  segments: { type: Array, required: true },
  summary: { type: String },
  segmentDetails: { type: Object },
  segmentInsights: { type: Object }, // AI-generated insights per segment
  
  // 🆕 Quality metrics
  qualityMetrics: {
    silhouetteScore: { type: Number },
    inertia: { type: Number },
    elbow_score: { type: Number },
    modelAccuracy: { type: Number }
  },
  
  // 🆕 File metadata
  fileMetadata: {
    originalFileName: { type: String, required: true },
    fileSize: { type: Number },
    totalRows: { type: Number },
    totalColumns: { type: Number },
    numericColumns: [{ type: String }],
    categoricalColumns: [{ type: String }],
    missingValues: { type: Number, default: 0 }
  },
  
  // 🆕 Usage tracking
  usage: {
    viewCount: { type: Number, default: 0 },
    exportCount: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now },
    isBookmarked: { type: Boolean, default: false },
    tags: [{ type: String }] // User-defined tags
  },
  
  // 🆕 Reprocessing history
  parentHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SegmentHistory' },
  reprocessingReason: { type: String }, // 'parameter_change', 'feature_selection', etc.
  version: { type: Number, default: 1 },
  
  // Status
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed', 'archived'], 
    default: 'completed' 
  },
  errorMessage: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 🆕 Update timestamps on save
SegmentHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 🆕 Instance methods
SegmentHistorySchema.methods.incrementView = function() {
  this.usage.viewCount += 1;
  this.usage.lastAccessedAt = new Date();
  return this.save();
};

SegmentHistorySchema.methods.incrementExport = function() {
  this.usage.exportCount += 1;
  return this.save();
};

SegmentHistorySchema.methods.addTag = function(tag) {
  if (!this.usage.tags.includes(tag)) {
    this.usage.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// 🆕 Static methods for analytics
SegmentHistorySchema.statics.getUserAnalytics = async function(userId) {
  const analytics = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalUploads: { $sum: 1 },
        totalSegments: { $sum: { $size: '$segments' } },
        avgClusterCount: { $avg: '$clusteringConfig.numberOfClusters' },
        totalViews: { $sum: '$usage.viewCount' },
        totalExports: { $sum: '$usage.exportCount' },
        mostUsedFeatures: { $push: '$clusteringConfig.selectedFeatures' },
        avgModelAccuracy: { $avg: '$qualityMetrics.modelAccuracy' }
      }
    }
  ]);
  
  return analytics[0] || {
    totalUploads: 0,
    totalSegments: 0,
    avgClusterCount: 0,
    totalViews: 0,
    totalExports: 0,
    mostUsedFeatures: [],
    avgModelAccuracy: 0
  };
};

SegmentHistorySchema.statics.getRecentHistory = function(userId, limit = 10) {
  return this.find({ userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('fileMetadata.originalFileName summary segmentDetails.segments_count createdAt usage.viewCount');
};

// 🆕 Indexes for performance
SegmentHistorySchema.index({ userId: 1, createdAt: -1 });
SegmentHistorySchema.index({ userId: 1, status: 1 });
SegmentHistorySchema.index({ 'usage.isBookmarked': 1 });

module.exports = mongoose.model('SegmentHistory', SegmentHistorySchema);