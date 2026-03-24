const express = require('express');
const {
  getPlatformStats,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  deleteUser,
  getListingReport
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// GET /api/admin/stats - Platform statistics
router.get('/stats', getPlatformStats);

// GET /api/admin/pending-properties - Pending properties
router.get('/pending-properties', getPendingProperties);

// PUT /api/admin/approve-property/:id - Approve property
router.put('/approve-property/:id', approveProperty);

// PUT /api/admin/reject-property/:id - Reject property
router.put('/reject-property/:id', rejectProperty);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', deleteUser);

// GET /api/admin/listing-report - Generate report
router.get('/listing-report', getListingReport);

module.exports = router;