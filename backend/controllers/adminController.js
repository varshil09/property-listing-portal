const Property = require('../models/Property');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
  try {
    console.log('Fetching platform stats...');

    const totalProperties = await Property.countDocuments();
    const approvedProperties = await Property.countDocuments({ status: 'approved' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const rejectedProperties = await Property.countDocuments({ status: 'rejected' });
    const soldProperties = await Property.countDocuments({ status: 'sold' });
    const rentedProperties = await Property.countDocuments({ status: 'rented' });
    const totalUsers = await User.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    const viewsResult = await Property.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult[0]?.total || 0;

    const stats = {
      totalProperties,
      approvedProperties,
      pendingProperties,
      rejectedProperties,
      soldProperties,
      rentedProperties,
      totalUsers,
      totalInquiries,
      totalViews
    };

    console.log('Stats fetched:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all pending properties
// @route   GET /api/admin/pending-properties
// @access  Private/Admin
const getPendingProperties = async (req, res) => {
  try {
    console.log('Fetching pending properties...');

    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    console.log(`Found ${properties.length} pending properties`);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get pending properties error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve property
// @route   PUT /api/admin/approve-property/:id
// @access  Private/Admin
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.status = 'approved';
    await property.save();

    console.log(`Property ${property._id} approved`);

    res.json({
      success: true,
      data: property,
      message: 'Property approved successfully'
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject property
// @route   PUT /api/admin/reject-property/:id
// @access  Private/Admin
const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.status = 'rejected';
    await property.save();

    console.log(`Property ${property._id} rejected`);

    res.json({
      success: true,
      data: property,
      message: 'Property rejected'
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');

    const users = await User.find().select('-password').sort('-createdAt');

    console.log(`Found ${users.length} users`);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Also delete user's properties and inquiries
    await Property.deleteMany({ owner: user._id });
    await Inquiry.deleteMany({ $or: [{ buyer: user._id }, { owner: user._id }] });

    await user.deleteOne();

    console.log(`User ${user.email} deleted with their properties and inquiries`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get listing report
// @route   GET /api/admin/listing-report
// @access  Private/Admin
const getListingReport = async (req, res) => {
  try {
    console.log('Generating listing report...');

    const properties = await Property.find()
      .populate('owner', 'name email')
      .sort('-createdAt');

    console.log(`Report generated with ${properties.length} properties`);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get listing report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPlatformStats,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  deleteUser,
  getListingReport
};