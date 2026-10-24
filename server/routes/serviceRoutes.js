const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getAllServiceRequests,
  getMyServiceRequests,
  updateServiceRequest,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createServiceRequest);
router.get('/my-requests', protect, getMyServiceRequests);
router.get('/', protect, authorize('staff', 'admin'), getAllServiceRequests);
router.put('/:id', protect, authorize('staff', 'admin'), updateServiceRequest);

module.exports = router;
