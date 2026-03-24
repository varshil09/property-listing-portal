const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/users/favorites - Get user favorites
router.get('/favorites', getFavorites);

// POST /api/users/favorites - Add to favorites
router.post('/favorites', addToFavorites);

// DELETE /api/users/favorites/:propertyId - Remove from favorites
router.delete('/favorites/:propertyId', removeFromFavorites);

// PUT /api/users/profile - Update profile
router.put('/profile', updateProfile);

module.exports = router;