const Property = require('../models/Property');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a property with images
// @route   POST /api/properties
// @access  Private (Owner/Admin)
const createProperty = async (req, res) => {
  try {
    console.log('Creating property for user:', req.user._id);
    console.log('Property data:', req.body);
    console.log('Files:', req.files);

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // Cloudinary returns path
      console.log('Uploaded images:', imageUrls);
    }

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      status: 'pending',
      images: imageUrls
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

// @desc    Update property with images
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

    // Process new images if uploaded
    let imageUrls = property.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const oldImage of property.images) {
        if (oldImage) {
          const publicId = oldImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`property-portal/${publicId}`);
        }
      }
      // Add new images
      imageUrls = req.files.map(file => file.path);
    }

    const updateData = {
      ...req.body,
      images: imageUrls
    };

    property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// @desc    Delete property with images
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

    // Delete images from Cloudinary
    for (const image of property.images) {
      if (image) {
        try {
          const publicId = image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`property-portal/${publicId}`);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
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

// ... rest of the controller functions (getProperties, getPropertyById, etc.) remain the same
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

    if (!req.user) {
      query.status = 'approved';
    } else if (req.user.role === 'buyer') {
      query.status = 'approved';
    } else if (req.user.role === 'admin' && status && status !== '') {
      query.status = status;
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    let properties;

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

const getPropertyById = async (req, res) => {
  try {
    console.log('Fetching property by ID:', req.params.id);

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

    if (req.user) {
      if (req.user.role === 'buyer' && property.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this property'
        });
      }
    } else {
      if (property.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'This property is not available for public viewing'
        });
      }
    }

    property.views += 1;
    await property.save();

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