const express = require('express');
const {
  createInquiry,
  getMyInquiries,
  getPropertyInquiries,
  respondToInquiry
} = require('../controllers/inquiryController');
const { protect, buyer, owner } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/inquiries/my-inquiries - Get buyer's inquiries (SPECIFIC ROUTE)
router.get('/my-inquiries', getMyInquiries);

// GET /api/inquiries/owner-inquiries - Get owner's property inquiries (SPECIFIC ROUTE)
router.get('/owner-inquiries', owner, getPropertyInquiries);

// POST /api/inquiries - Create inquiry (protected)
router.post('/', buyer, createInquiry);

// PUT /api/inquiries/:id/respond - Respond to inquiry (SPECIFIC ACTION)
// This MUST come BEFORE the generic /:id route
router.put('/:id/respond', owner, respondToInquiry);

module.exports = router;