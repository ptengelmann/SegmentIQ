// server/models/Profile.js
import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed, // Flexible structure for each profile row
    segmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }], // Optional for tracking which segments a profile belongs to
    lastActivity: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    // Add index for common query fields
    // This depends on your specific use case, but often searching by email is common
    indexes: [
      { 'data.email': 1 },
      { createdAt: -1 }
    ]
  }
);

export default mongoose.model('Profile', ProfileSchema);