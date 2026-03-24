const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Private (Buyer)
const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    console.log('Creating inquiry for property:', propertyId);
    console.log('Buyer:', req.user._id);

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if inquiry already exists
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      buyer: req.user._id
    });

    if (existingInquiry) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent an inquiry for this property'
      });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user._id,
      owner: property.owner,
      message
    });

    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'title price location images')
      .populate('buyer', 'name email phone')
      .populate('owner', 'name email phone');

    console.log('Inquiry created:', inquiry._id);

    res.status(201).json({
      success: true,
      data: populatedInquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my inquiries (as buyer)
// @route   GET /api/inquiries/my-inquiries
// @access  Private (Buyer)
const getMyInquiries = async (req, res) => {
  try {
    console.log('Fetching inquiries for buyer:', req.user._id);

    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate('property', 'title price location images listingType')
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    console.log(`Found ${inquiries.length} inquiries for buyer`);

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Get my inquiries error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inquiries for my properties (as owner)
// @route   GET /api/inquiries/owner-inquiries
// @access  Private (Owner)
const getPropertyInquiries = async (req, res) => {
  try {
    console.log('Fetching inquiries for owner:', req.user._id);

    const inquiries = await Inquiry.find({ owner: req.user._id })
      .populate('property', 'title price location images listingType')
      .populate('buyer', 'name email phone')
      .sort('-createdAt');

    console.log(`Found ${inquiries.length} inquiries for owner properties`);

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Get property inquiries error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Respond to inquiry
// @route   PUT /api/inquiries/:id/respond
// @access  Private (Owner)
const respondToInquiry = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response'
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if user is the owner
    if (inquiry.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to respond to this inquiry'
      });
    }

    inquiry.response = response;
    inquiry.status = 'responded';
    inquiry.respondedAt = Date.now();
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'title price location')
      .populate('buyer', 'name email phone')
      .populate('owner', 'name email phone');

    console.log(`Responded to inquiry ${inquiry._id}`);

    res.json({
      success: true,
      data: updatedInquiry,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Respond to inquiry error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createInquiry,
  getMyInquiries,
  getPropertyInquiries,
  respondToInquiry
};