const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/erino-leads');
    
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erino-leads';
    
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
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('IP whitelist')) {
      console.log('\n🔒 MongoDB Atlas IP Whitelist Issue:');
      console.log('1. Go to MongoDB Atlas dashboard: https://cloud.mongodb.com/');
      console.log('2. Click "Network Access" in the left sidebar');
      console.log('3. Click "Add IP Address"');
      console.log('4. Add your current IP or use "0.0.0.0/0" for all IPs (development only)');
      console.log('5. Wait a few minutes for changes to take effect');
      console.log('\n💡 Quick fix for development: Add "0.0.0.0/0" to allow all IPs');
    } else if (error.name === 'MongoNetworkError') {
      console.log('\n💡 Network Connection Issues:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the MongoDB Atlas cluster is running');
      console.log('3. Check if your firewall is blocking the connection');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔑 Authentication Issues:');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Ensure the user has proper permissions');
      console.log('3. Verify the database name is correct');
    }
    
    process.exit(1);
  }
}

testConnection();
