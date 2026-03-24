const Property = require('../models/Property');
const mongoose = require('mongoose');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Owner/Admin)
const createProperty = async (req, res) => {
  try {
    console.log('Creating property for user:', req.user._id);
    console.log('Property data:', req.body);

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      status: 'pending'
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    console.log('Fetching properties with query:', req.query);

    const {
      location,
      minPrice,
      maxPrice,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      sort,
      status
    } = req.query;

    const query = {};

    // Build search query
    if (location && location.trim() !== '') {
      query.location = new RegExp(location, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (propertyType && propertyType !== '') {
      query.propertyType = propertyType;
    }

    if (listingType && listingType !== '') {
      query.listingType = listingType;
    }

    if (bedrooms && bedrooms !== '') {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    if (bathrooms && bathrooms !== '') {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    // Status filtering based on user role
    if (!req.user) {
      // Public users only see approved properties
      query.status = 'approved';
    } else if (req.user.role === 'buyer') {
      // Buyers only see approved properties
      query.status = 'approved';
    } else if (req.user.role === 'owner') {
      // Owners see their own properties regardless of status + approved properties
      // We'll handle this with $or in the find query
    } else if (req.user.role === 'admin') {
      // Admins see all properties
      if (status && status !== '') {
        query.status = status;
      }
    }

    // Build sort
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    let properties;

    // Handle owner role special case
    if (req.user && req.user.role === 'owner') {
      properties = await Property.find({
        $or: [
          query,
          { owner: req.user._id }
        ]
      })
      .populate('owner', 'name email phone')
      .sort(sortOption);
    } else {
      properties = await Property.find(query)
        .populate('owner', 'name email phone')
        .sort(sortOption);
    }

    console.log(`Found ${properties.length} properties`);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    console.log('Fetching property by ID:', req.params.id);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }

    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user has permission to view this property
    if (req.user) {
      // Admin can view all
      // Owner can view their own properties even if not approved
      // Buyer can only view approved properties
      if (req.user.role === 'buyer' && property.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this property'
        });
      }
    } else {
      // Public users can only view approved properties
      if (property.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'This property is not available for public viewing'
        });
      }
    }

    // Increment views
    property.views += 1;
    await property.save();

    console.log('Property found:', property.title);

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my properties (for owner)
// @route   GET /api/properties/my-properties
// @access  Private (Owner/Admin)
const getMyProperties = async (req, res) => {
  try {
    console.log('Fetching my properties for user:', req.user._id);

    const properties = await Property.find({ owner: req.user._id })
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    console.log(`Found ${properties.length} properties for user`);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark property as sold/rented
// @route   PUT /api/properties/:id/mark-sold
// @access  Private (Owner)
const markAsSold = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    property.status = req.body.status === 'sold' ? 'sold' : 'rented';
    await property.save();

    res.json({
      success: true,
      data: property,
      message: `Property marked as ${req.body.status}`
    });
  } catch (error) {
    console.error('Mark as sold error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  markAsSold
};