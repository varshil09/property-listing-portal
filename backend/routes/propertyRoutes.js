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

const router = express.Router();

// ============================================
// CRITICAL: ORDER MATTERS - SPECIFIC ROUTES FIRST
// ============================================

// GET /api/properties - Get all properties (public)
router.get('/', getProperties);

// GET /api/properties/my-properties - Get user's properties (protected, SPECIFIC ROUTE)
// This MUST come BEFORE the /:id route
router.get('/my-properties', protect, getMyProperties);

// GET /api/properties/:id - Get single property (public, PARAMETERIZED ROUTE)
// This comes AFTER specific routes
router.get('/:id', getPropertyById);

// POST /api/properties - Create property (protected)
router.post('/', protect, owner, createProperty);

// PUT /api/properties/:id/mark-sold - Mark as sold (protected, SPECIFIC ACTION)
// This MUST come BEFORE the generic /:id routes
router.put('/:id/mark-sold', protect, owner, markAsSold);

// PUT /api/properties/:id - Update property (protected)
router.put('/:id', protect, owner, updateProperty);

// DELETE /api/properties/:id - Delete property (protected)
router.delete('/:id', protect, owner, deleteProperty);

module.exports = router;