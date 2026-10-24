const express = require('express');
const router = express.Router();
const {
  checkInGuest,
  checkOutGuest,
  updateHousekeeping,
  getStaffOverview,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('staff', 'admin'));

router.get('/overview', getStaffOverview);
router.post('/check-in/:bookingId', checkInGuest);
router.post('/check-out/:bookingId', checkOutGuest);
router.put('/rooms/:roomId/housekeeping', updateHousekeeping);

module.exports = router;
