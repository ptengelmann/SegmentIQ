// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 🆕 Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    
    // 🆕 Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    
    // 🆕 User preferences
    preferences: {
      theme: { type: String, default: 'light' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
      },
      defaultClusterCount: { type: Number, default: 0 }, // 0 = auto
      autoAnalysis: { type: Boolean, default: true }
    },
    
    // 🆕 Usage analytics
    analytics: {
      totalUploads: { type: Number, default: 0 },
      totalSegments: { type: Number, default: 0 },
      lastLoginAt: { type: Date },
      signupSource: { type: String, default: 'direct' }
    },
    
    // 🆕 Account status
    isActive: { type: Boolean, default: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    planExpires: { type: Date }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 🆕 Generate password reset token
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken; // Return unhashed token
};

// 🆕 Generate email verification token
UserSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// 🆕 Update user analytics
UserSchema.methods.updateAnalytics = function(type, increment = 1) {
  switch(type) {
    case 'upload':
      this.analytics.totalUploads += increment;
      break;
    case 'segment':
      this.analytics.totalSegments += increment;
      break;
    case 'login':
      this.analytics.lastLoginAt = new Date();
      break;
  }
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);