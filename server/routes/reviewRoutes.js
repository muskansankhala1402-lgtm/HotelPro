const express = require('express');
const router = express.Router();
const {
  createReview,
  getRoomReviews,
  getAllReviews,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/room/:roomId', getRoomReviews);
router.post('/', protect, createReview);
router.get('/', protect, authorize('staff', 'admin'), getAllReviews);
router.post('/:id/reply', protect, authorize('staff', 'admin'), replyToReview);

module.exports = router;
