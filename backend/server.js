const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fixes X-Forwarded-For header warning)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting with improved configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection with improved configuration
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erino-leads';
    
    // Get database name from environment or use default
    const dbName = process.env.DB_NAME || 'erino-leads';
    
    // Ensure database name is specified for MongoDB Atlas
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes(`/${dbName}`)) {
      // Parse the URI more carefully to avoid corruption
      const urlParts = mongoURI.split('?');
      const basePart = urlParts[0];
      const queryPart = urlParts.length > 1 ? '?' + urlParts[1] : '';
      
      // Ensure the base part ends cleanly without trailing slashes
      const cleanBase = basePart.endsWith('/') ? basePart.slice(0, -1) : basePart;
      
      // Construct clean URI with database name
      mongoURI = cleanBase + `/${dbName}` + queryPart;
    }
    
    console.log('Connecting to MongoDB with URI:', mongoURI.replace(/:[^:@]+@/, ':****@'));
    console.log('Database:', dbName);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    
    if (err.message.includes('IP whitelist')) {
      console.log('\n MongoDB Atlas IP Whitelist Issue:');
      console.log('1. Go to MongoDB Atlas dashboard');
      console.log('2. Click "Network Access" in the left sidebar');
      console.log('3. Click "Add IP Address"');
      console.log('4. Add your current IP or use "0.0.0.0/0" for all IPs (development only)');
      console.log('5. Wait a few minutes for changes to take effect');
    } else if (err.message.includes('Invalid database name')) {
      console.log('\n Database Name Issue:');
      console.log('1. Check your MONGODB_URI in .env file');
      console.log('2. Ensure it follows the correct format');
      console.log('3. The URI should end with the cluster domain, not a database name');
      console.log('4. Current URI being used:', mongoURI.replace(/:[^:@]+@/, ':****@'));
    }
    
    // Exit process if database connection fails
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticateToken, leadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Lead Management System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
