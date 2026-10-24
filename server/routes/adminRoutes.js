const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getUsers,
  updateUser,
  getActivityLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/analytics', getDashboardAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
