const express = require('express');
const cors = require('cors');
// Remove this line: const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const segmentRoutes = require('./routes/segmentRoutes');
const insightRoutes = require('./routes/insightRoutes');

// Remove this line: dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/segment', segmentRoutes);
app.use('/api/insight', insightRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running.' });
});

module.exports = app;