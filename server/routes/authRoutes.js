// server/routes/authRoutes.js
const express = require('express');
const { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  updatePreferences, 
  getProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getProfile);
router.patch('/preferences', protect, updatePreferences);

// 🆕 Resend verification email
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const { sendEmail } = require('../services/emailService');
    
    const user = await User.findById(req.user.id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    await sendEmail({
      email: user.email,
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
      }
    });

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

module.exports = router;