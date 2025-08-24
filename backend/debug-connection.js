const mongoose = require('mongoose');
require('dotenv').config();

async function debugConnection() {
  console.log('🔍 MongoDB Connection Debugger\n');
  
  // Show current environment
  console.log('📋 Environment Variables:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is not set in your .env file');
    console.log('💡 Create a .env file with your MongoDB Atlas connection string');
    return;
  }
  
  // Parse and display connection string info
  const uri = process.env.MONGODB_URI;
  console.log('🔗 Connection String Analysis:');
  
  if (uri.includes('mongodb+srv://')) {
    console.log('✅ MongoDB Atlas connection detected');
    
    // Extract username
    const usernameMatch = uri.match(/mongodb\+srv:\/\/([^:]+):/);
    if (usernameMatch) {
      console.log('👤 Username:', usernameMatch[1]);
    }
    
    // Check if password is masked
    if (uri.includes('<db_password>')) {
      console.log('🔑 Password: ❌ Still using placeholder <db_password>');
      console.log('💡 Replace <db_password> with your actual password');
    } else if (uri.includes(':')) {
      console.log('🔑 Password: ✅ Set (length:', uri.split(':')[1].split('@')[0].length, 'characters)');
    }
    
    // Check cluster info
    const clusterMatch = uri.match(/@([^\/\?]+)/);
    if (clusterMatch) {
      console.log('🌐 Cluster:', clusterMatch[1]);
    }
    
    // Check database name
    if (uri.includes('/erino-leads')) {
      console.log('🗄️  Database: ✅ erino-leads specified');
    } else {
      console.log('🗄️  Database: ⚠️  Will be auto-added as erino-leads');
    }
    
  } else {
    console.log('🏠 Local MongoDB connection detected');
  }
  
  console.log('');
  console.log('🧪 Testing connection...');
  
  try {
    let mongoURI = uri;
    
    // Ensure database name is specified for MongoDB Atlas
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('/erino-leads')) {
      // Parse the URI more carefully to avoid corruption
      const urlParts = mongoURI.split('?');
      const basePart = urlParts[0];
      const queryPart = urlParts.length > 1 ? '?' + urlParts[1] : '';
      
      // Ensure the base part ends cleanly without trailing slashes
      const cleanBase = basePart.endsWith('/') ? basePart.slice(0, -1) : basePart;
      
      // Construct clean URI with database name
      mongoURI = cleanBase + '/erino-leads' + queryPart;
    }
    
    console.log('🔗 Final URI:', mongoURI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connection successful!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Debug completed successfully');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    // Provide specific guidance based on error
    if (error.message.includes('authentication failed')) {
      console.log('\n🔑 Authentication Issues:');
      console.log('1. Check username and password in your .env file');
      console.log('2. Verify the user exists in MongoDB Atlas');
      console.log('3. Ensure the user has proper permissions');
      console.log('4. Try resetting the user password in Atlas');
    } else if (error.message.includes('IP whitelist')) {
      console.log('\n🔒 IP Whitelist Issue:');
      console.log('1. Add your IP to MongoDB Atlas Network Access');
      console.log('2. Use "Allow Access from Anywhere" for development');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster name is correct');
    }
  }
}

debugConnection();
