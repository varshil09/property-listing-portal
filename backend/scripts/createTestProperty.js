const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
require('dotenv').config();

async function createTestProperty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user (owner or admin)
    const user = await User.findOne({ role: { $in: ['owner', 'admin'] } });

    if (!user) {
      console.log('No owner/admin user found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Creating test property for user: ${user.name} (${user._id})`);

    const testProperty = new Property({
      title: 'Test Property',
      description: 'This is a test property to verify the system is working.',
      price: 250000,
      location: 'Test City',
      address: '123 Test Street, Test City, TS 12345',
      propertyType: 'house',
      listingType: 'sale',
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      owner: user._id,
      status: 'approved',
      views: 0
    });

    await testProperty.save();
    console.log('✅ Test property created successfully!');
    console.log('Property ID:', testProperty._id);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test property:', error);
  }
}

createTestProperty();