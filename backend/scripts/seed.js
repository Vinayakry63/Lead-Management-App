const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');
require('dotenv').config();

// Sample data for leads
const sampleLeads = [
  {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith.1@techcorp.com',
    phone: '+1234567890',
    company: 'TechCorp Solutions',
    city: 'San Francisco',
    state: 'CA',
    source: 'website',
    status: 'new',
    score: 85,
    lead_value: 15000,
    is_qualified: false
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j.2@innovateinc.com',
    phone: '+1987654321',
    company: 'Innovate Inc',
    city: 'New York',
    state: 'NY',
    source: 'google_ads',
    status: 'contacted',
    score: 92,
    lead_value: 25000,
    is_qualified: true
  },
  {
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'm.brown.3@startupxyz.com',
    phone: '+1555123456',
    company: 'StartupXYZ',
    city: 'Austin',
    state: 'TX',
    source: 'referral',
    status: 'qualified',
    score: 78,
    lead_value: 18000,
    is_qualified: true
  },
  {
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.d.4@globaltech.com',
    phone: '+1444333222',
    company: 'GlobalTech Industries',
    city: 'Seattle',
    state: 'WA',
    source: 'facebook_ads',
    status: 'won',
    score: 95,
    lead_value: 35000,
    is_qualified: true
  },
  {
    first_name: 'David',
    last_name: 'Wilson',
    email: 'dwilson.5@megacorp.com',
    phone: '+1777888999',
    company: 'MegaCorp Ltd',
    city: 'Chicago',
    state: 'IL',
    source: 'events',
    status: 'lost',
    score: 45,
    lead_value: 8000,
    is_qualified: false
  }
];

// Generate additional random leads
const generateRandomLeads = (count) => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Blake', 'Cameron'];
  const lastNames = ['Anderson', 'Thompson', 'White', 'Harris', 'Martin', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const companies = ['TechStart', 'Digital Solutions', 'Cloud Corp', 'Data Systems', 'Web Innovations', 'Mobile Apps Inc', 'AI Technologies', 'Cyber Security Co', 'Software Solutions', 'IT Consulting'];
  const cities = ['Los Angeles', 'Miami', 'Denver', 'Phoenix', 'Portland', 'Nashville', 'Charlotte', 'Orlando', 'Minneapolis', 'Salt Lake City'];
  const states = ['CA', 'FL', 'CO', 'AZ', 'OR', 'TN', 'NC', 'FL', 'MN', 'UT'];
  const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
  const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

  const leads = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const score = Math.floor(Math.random() * 101);
    const leadValue = Math.floor(Math.random() * 50000) + 5000;
    const isQualified = Math.random() > 0.5;

    leads.push({
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
      company,
      city,
      state,
      source,
      status,
      score,
      lead_value: leadValue,
      is_qualified: isQualified,
      last_activity_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
  }
  
  return leads;
};

const seedDatabase = async () => {
  try {
    // Get the connection string and ensure database name is specified
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
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const testUser = new User({
      email: 'test@erino.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();
    console.log('Created test user:', testUser.email);

    // Create leads with test user reference
    const allLeads = [
      ...sampleLeads,
      ...generateRandomLeads(95) // Generate 95 more random leads to make 100 total
    ];

    const leadsWithUser = allLeads.map(lead => ({
      ...lead,
      user: testUser._id
    }));

    await Lead.insertMany(leadsWithUser);
    console.log(`Created ${leadsWithUser.length} leads`);

    // Verify the data
    const userCount = await User.countDocuments();
    const leadCount = await Lead.countDocuments();
    
    console.log('\n=== Database Seeded Successfully ===');
    console.log(`Users: ${userCount}`);
    console.log(`Leads: ${leadCount}`);
    console.log('\n=== Test Credentials ===');
    console.log('Email: test@erino.com');
    console.log('Password: test123');
    console.log('\nYou can now test the application with these credentials!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
