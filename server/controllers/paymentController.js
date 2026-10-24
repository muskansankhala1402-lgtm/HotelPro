const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { generateInvoiceData } = require('../utils/invoiceGenerator');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin / Staff)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        select: 'bookingReference totalAmount status checkInDate checkOutDate',
        populate: { path: 'room', select: 'roomNumber' },
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice for a booking
// @route   GET /api/payments/invoice/:bookingId
// @access  Private
exports.getInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('guest')
      .populate({ path: 'room', populate: { path: 'category' } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      req.user.role === 'guest' &&
      booking.guest._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const payment = await Payment.findOne({ booking: booking._id });
    const invoice = generateInvoiceData(booking, payment, booking.guest);

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment gateway charge
// @route   POST /api/payments/charge
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const { amount, bookingId, paymentMethod = 'Credit Card', cardLast4 = '4242' } = req.body;

    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      transactionId,
      amount,
      paymentMethod,
      status: 'Success',
      cardLast4,
      notes: 'Card payment processed successfully via HotelPro Gateway',
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
