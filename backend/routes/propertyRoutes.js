const express = require('express');
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  markAsSold
} = require('../controllers/propertyController');
const { protect, owner } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/my-properties', protect, getMyProperties);
router.get('/:id', getPropertyById);

// Protected routes with file upload
router.use(protect);

// Create property with image upload (max 5 images)
router.post('/', owner, upload.array('images', 5), createProperty);

// Update property with image upload
router.put('/:id', owner, upload.array('images', 5), updateProperty);

// Other routes
router.put('/:id/mark-sold', owner, markAsSold);
router.delete('/:id', owner, deleteProperty);

module.exports = router;