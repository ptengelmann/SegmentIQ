const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const segmentRoutes = require('./routes/segmentRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' })); // 🔧 Increase JSON payload size limit
app.use(express.urlencoded({ extended: true, limit: '5mb' })); // Optional: support form data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/segment', segmentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running.' });
});

module.exports = app;
