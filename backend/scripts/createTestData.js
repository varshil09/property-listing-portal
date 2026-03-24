const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const owner = await User.findOneAndUpdate(
      { email: 'owner@test.com' },
      {
        name: 'Test Owner',
        email: 'owner@test.com',
        password: hashedPassword,
        role: 'owner',
        phone: '1234567890',
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    const buyer = await User.findOneAndUpdate(
      { email: 'buyer@test.com' },
      {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: hashedPassword,
        role: 'buyer',
        phone: '0987654321',
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('Users created/updated:', owner.email, buyer.email);

    // Create test properties
    const properties = [
      {
        title: 'Luxury Apartment in Downtown',
        description: 'Beautiful 3-bedroom apartment with stunning city views',
        price: 350000,
        location: 'New York',
        address: '123 Main St, New York, NY 10001',
        propertyType: 'apartment',
        listingType: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1200,
        owner: owner._id,
        status: 'approved',
        views: 0
      },
      {
        title: 'Cozy Family Home',
        description: 'Perfect family home with garden and garage',
        price: 450000,
        location: 'Los Angeles',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        propertyType: 'house',
        listingType: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2000,
        owner: owner._id,
        status: 'pending',
        views: 0
      },
      {
        title: 'Modern Studio Apartment',
        description: 'Modern studio apartment in prime location',
        price: 1800,
        location: 'Chicago',
        address: '789 Pine St, Chicago, IL 60007',
        propertyType: 'apartment',
        listingType: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 600,
        owner: owner._id,
        status: 'approved',
        views: 0
      }
    ];

    for (const propData of properties) {
      await Property.findOneAndUpdate(
        { title: propData.title },
        propData,
        { upsert: true, new: true }
      );
    }

    console.log('Properties created/updated');

    // Create test inquiries
    const allProperties = await Property.find({ owner: owner._id });

    if (allProperties.length > 0 && buyer) {
      const inquiry = await Inquiry.findOneAndUpdate(
        { buyer: buyer._id, property: allProperties[0]._id },
        {
          property: allProperties[0]._id,
          buyer: buyer._id,
          owner: owner._id,
          message: 'I am very interested in this property. Could you please provide more details?',
          status: 'pending',
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log('Inquiry created/updated');
    }

    console.log('\n✅ Test data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Owner: owner@test.com / password123');
    console.log('Buyer: buyer@test.com / password123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();