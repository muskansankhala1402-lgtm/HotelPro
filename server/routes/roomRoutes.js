const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  getCategories,
  createCategory,
  createRoom,
  updateRoom,
  deleteRoom,
  updateSeasonalPricing,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/categories/all', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);

router.get('/', getRooms);
router.get('/:id', getRoomById);

router.post('/', protect, authorize('staff', 'admin'), createRoom);
router.put('/:id', protect, authorize('staff', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

router.post('/seasonal-pricing', protect, authorize('admin'), updateSeasonalPricing);

// File upload endpoint for room photos
router.post('/upload', protect, authorize('staff', 'admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
