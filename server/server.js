// server/server.js
const dotenv = require('dotenv');

// Load environment variables FIRST, before anything else
dotenv.config();

// Debug: Check if env vars are loaded
console.log('🔍 Environment Variables Check:');
console.log('PORT:', process.env.PORT || 'Using default 5000');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');

const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing from environment variables');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });