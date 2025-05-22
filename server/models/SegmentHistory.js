const mongoose = require('mongoose');

const SegmentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Array, required: true },
  segments: { type: Array, required: true },
  summary: { type: String },
  segmentDetails: { type: Object },
  featuresUsed: { type: Array },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SegmentHistory', SegmentHistorySchema);
