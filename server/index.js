// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './utils/logger.js'; // Custom logger utility
// Import routes
import segmentRoutes from './routes/segments.js';
import profileRoutes from './routes/profiles.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Existing middlewares FIRST (important for body parsing)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Enhanced logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Custom request logging middleware with SAFE body handling
app.use((req, res, next) => {
  const start = Date.now();
  
  // Safe body stringification - check if body exists and has content
  let bodyPreview = undefined;
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    try {
      const bodyStr = JSON.stringify(req.body);
      if (bodyStr && bodyStr.length > 2) { // More than just "{}"
        bodyPreview = bodyStr.length > 500 ? bodyStr.substring(0, 500) + '...' : bodyStr;
      }
    } catch (e) {
      bodyPreview = '[Body parsing error]';
    }
  }
  
  // Log incoming request
  logger.info(`🔵 INCOMING: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: bodyPreview
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    const emoji = res.statusCode >= 400 ? '🔴' : '🟢';
    
    logger[logLevel](`${emoji} RESPONSE: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
  });

  next();
});

// Connect to MongoDB with enhanced logging
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('📊 MongoDB connected successfully', {
    database: process.env.MONGO_URI?.split('/').pop()?.split('?')[0]
  });
})
.catch(err => {
  logger.error('❌ Database connection error:', err);
  process.exit(1);
});

// Enhanced API Routes with logging
app.use('/api/segments', (req, res, next) => {
  logger.info('🔗 Routing to segments API');
  next();
}, segmentRoutes);

app.use('/api/profiles', (req, res, next) => {
  logger.info('👤 Routing to profiles API');
  next();
}, profileRoutes);

app.use('/api/dashboard', (req, res, next) => {
  logger.info('📈 Routing to dashboard API');
  next();
}, dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  logger.info('🏠 Root endpoint accessed');
  res.send('SegmentIQ API running');
});

// 404 handler with logging
app.use((req, res) => {
  logger.warn(`🚫 404 - Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  res.status(404).json({ error: 'Route not found' });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  logger.error('💥 Unhandled error occurred', {
    error: err.message,
    method: req.method,
    url: req.originalUrl || req.url || 'unknown',
    params: req.params || {},
    query: req.query || {},
    stack: err.stack,
    timestamp
  });
  
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    timestamp
  });
});

// Start server with enhanced logging
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 SegmentIQ API server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
  
  console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🚀 SegmentIQ API server running on ${PORT}     ║
║   📅 ${new Date().toLocaleString()}              ║
║   🔍 Logging enabled - Check console & logs/ ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown logging
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});