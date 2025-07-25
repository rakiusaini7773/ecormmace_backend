const express = require('express');
const router = express.Router();
const { verifyAdmin,verifyToken } = require('../middleware/auth'); // ✅ Only admin access

const {
  createOffer,
  getAllOffers,
  updateStatus,
} = require('../controllers/offerController');

// ✅ Admin-only routes
router.post('/add',verifyToken, verifyAdmin, createOffer);            // Add offer card
router.get('/', getAllOffers);               // Get all offer cards
router.put('/:id/status',verifyToken, verifyAdmin, updateStatus);     // Change status

module.exports = router;
