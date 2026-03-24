const Favorite = require('../models/Favorite');
const User = require('../models/User');

// @desc    Add property to favorites
// @route   POST /api/users/favorites
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const favorite = await Favorite.create({
      user: req.user._id,
      property: propertyId
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/users/favorites/:propertyId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.user._id,
      property: req.params.propertyId
    });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .sort('-createdAt');

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  updateProfile
};