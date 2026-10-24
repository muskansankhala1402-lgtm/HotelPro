const Review = require('../models/Review');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Submit a review for a room
// @route   POST /api/reviews
// @access  Private (Guest)
exports.createReview = async (req, res, next) => {
  try {
    const { roomId, bookingId, rating, cleanlinessRating, comfortRating, serviceRating, comment } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if user already reviewed this room
    const existing = await Review.findOne({ room: roomId, user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this room. You can update your existing review.',
      });
    }

    const review = await Review.create({
      room: roomId,
      user: req.user._id,
      booking: bookingId || undefined,
      rating: Number(rating),
      cleanlinessRating: Number(cleanlinessRating) || Number(rating),
      comfortRating: Number(comfortRating) || Number(rating),
      serviceRating: Number(serviceRating) || Number(rating),
      comment,
      isApproved: true,
    });

    // Recalculate room average rating
    const allRoomReviews = await Review.find({ room: roomId, isApproved: true });
    const avgRating = allRoomReviews.reduce((acc, item) => acc + item.rating, 0) / allRoomReviews.length;

    room.rating = Math.round(avgRating * 10) / 10;
    room.numReviews = allRoomReviews.length;
    await room.save();

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a room
// @route   GET /api/reviews/room/:roomId
// @access  Public
exports.getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId, isApproved: true })
      .populate('user', 'name avatar')
      .populate('staffReply.repliedBy', 'name role')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin / Staff)
// @route   GET /api/reviews
// @access  Private (Staff / Admin)
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('room', 'roomNumber')
      .populate('staffReply.repliedBy', 'name role')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Staff / Admin)
exports.replyToReview = async (req, res, next) => {
  try {
    const { message } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.staffReply = {
      message,
      repliedAt: new Date(),
      repliedBy: req.user._id,
    };

    await review.save();

    const populated = await Review.findById(review._id)
      .populate('user', 'name email avatar')
      .populate('staffReply.repliedBy', 'name role');

    res.json({
      success: true,
      message: 'Reply posted successfully',
      review: populated,
    });
  } catch (error) {
    next(error);
  }
};
