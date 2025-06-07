// server/models/Segment.js
import mongoose from 'mongoose';

const FilterSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: { 
    type: String, 
    required: true,
    enum: ['=', '>', '<', 'contains', 'starts_with', 'ends_with']
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const SegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filters: [FilterSchema],
  previewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  // Add index for sorting by count and creation date
  indexes: [
    { previewCount: -1 },
    { createdAt: -1 }
  ]
});

export default mongoose.model('Segment', SegmentSchema);