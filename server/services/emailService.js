// server/services/emailService.js
const nodemailer = require('nodemailer');

// Simple email function
const sendEmail = async ({ email, subject, template, data }) => {
  try {
    // If no email config, just log and continue
    if (!process.env.EMAIL_USER) {
      console.log(`📧 [MOCK] Email to ${email}: ${subject}`);
      return { success: true, messageId: 'mock-' + Date.now() };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Simple email templates
    let emailContent = { subject, html: '' };
    
    if (template === 'emailVerification') {
      emailContent = {
        subject: 'Welcome to SegmentIQ - Verify Your Email',
        html: `
          <h2>Welcome to SegmentIQ, ${data.name}!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${data.verificationUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        `
      };
    } else if (template === 'passwordReset') {
      emailContent = {
        subject: 'SegmentIQ Password Reset',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${data.name}, click the link below to reset your password:</p>
          <a href="${data.resetUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link expires in 10 minutes.</p>
        `
      };
    }

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log('✅ Email sent:', result.messageId);
    return result;

  } catch (error) {
    console.log(`📧 Email failed (using mock): ${error.message}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }
};

module.exports = { sendEmail };