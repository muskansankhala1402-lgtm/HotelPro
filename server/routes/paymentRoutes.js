const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getInvoice,
  processPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('staff', 'admin'), getAllPayments);
router.get('/invoice/:bookingId', protect, getInvoice);
router.post('/charge', protect, processPayment);

module.exports = router;
