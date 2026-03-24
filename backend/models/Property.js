const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'land', 'commercial'],
    required: true,
    default: 'apartment'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true,
    default: 'sale'
  },
  bedrooms: {
    type: Number,
    required: true,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: [0, 'Bathrooms cannot be negative'],
    default: 0
  },
  area: {
    type: Number,
    required: true,
    min: [0, 'Area must be positive'],
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'rented'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

propertySchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Property', propertySchema);