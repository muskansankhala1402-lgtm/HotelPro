const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { sendEmail } = require('../utils/emailService');
const { generateInvoiceData } = require('../utils/invoiceGenerator');

// @desc    Create a new room booking & reservation
// @route   POST /api/bookings
// @access  Private (Guest / Staff / Admin)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount = { adults: 1, children: 0 },
      specialRequests = '',
      paymentMethod = 'Credit Card',
      cardLast4 = '4242',
    } = req.body;

    const room = await Room.findById(roomId).populate('category');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently undergoing maintenance and cannot be reserved.',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date' });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Check for conflicting active bookings
    const conflict = await Booking.findOne({
      room: room._id,
      status: { $in: ['Confirmed', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'This room is already reserved for the selected dates. Please choose different dates or another room.',
      });
    }

    // Calculate nights & pricing
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const pricePerNight = Math.round(room.pricePerNight * (room.seasonalPriceMultiplier || 1));
    const subtotal = pricePerNight * totalNights;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100; // 12% hotel occupancy tax
    const serviceFee = 25; // standard resort / cleaning service fee
    const discount = 0;
    const totalAmount = subtotal + taxes + serviceFee - discount;

    const bookingReference = `HP-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await Booking.create({
      bookingReference,
      guest: req.user._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      guestsCount,
      pricePerNight,
      subtotal,
      taxes,
      serviceFee,
      discount,
      totalAmount,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod,
      specialRequests,
      invoiceNumber,
    });

    // Create Payment Record
    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      transactionId,
      amount: totalAmount,
      paymentMethod,
      status: 'Success',
      cardLast4: cardLast4 || '4242',
      invoiceNumber,
      notes: `Online booking payment for ${bookingReference}`,
    });

    booking.paymentId = payment.transactionId;
    await booking.save();

    // Create in-app notification for the guest
    await Notification.create({
      recipient: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your reservation ${bookingReference} for Room ${room.roomNumber} is confirmed. Total: $${totalAmount}`,
      type: 'booking',
      link: `/guest/bookings`,
    });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: `HotelPro Reservation Confirmation #${bookingReference}`,
      text: `Dear ${req.user.name},\n\nYour stay at HotelPro is confirmed!\nRoom: ${room.roomNumber} (${room.category?.name || 'Suite'})\nCheck-in: ${checkIn.toDateString()}\nCheck-out: ${checkOut.toDateString()}\nTotal Amount: $${totalAmount}\nBooking Reference: ${bookingReference}\n\nWe look forward to welcoming you!`,
    });

    // Audit log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOKING_CREATE',
      category: 'Booking',
      details: `New reservation ${bookingReference} created for Room #${room.roomNumber} ($${totalAmount})`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: 'room', populate: { path: 'category' } })
      .populate('guest', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation created and confirmed successfully',
      booking: populatedBooking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Guest / Any authenticated)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate({ path: 'room', populate: { path: 'category' } })
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private (Staff / Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('guest', 'name email phone avatar')
      .populate({ path: 'room', populate: { path: 'category' } })
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID with full invoice details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate({ path: 'room', populate: { path: 'category' } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: must be the booking guest or staff/admin
    if (
      req.user.role === 'guest' &&
      booking.guest._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const payment = await Payment.findOne({ booking: booking._id });
    const invoice = generateInvoiceData(booking, payment, booking.guest);

    res.json({
      success: true,
      booking,
      payment,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking & process refund request
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by guest' } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      req.user.role === 'guest' &&
      booking.guest.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this reservation' });
    }

    if (['Checked-In', 'Checked-Out', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a reservation with status '${booking.status}'`,
      });
    }

    // Calculate refund policy: 100% refund if cancelled > 48h before checkIn, otherwise 80%
    const now = new Date();
    const hoursToCheckIn = (new Date(booking.checkInDate) - now) / (1000 * 60 * 60);
    const refundPercentage = hoursToCheckIn >= 48 ? 1.0 : 0.8;
    const refundAmount = Math.round(booking.totalAmount * refundPercentage * 100) / 100;

    booking.status = 'Cancelled';
    booking.cancellationReason = reason;
    booking.cancellationDate = now;
    booking.refundAmount = refundAmount;
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Create payment refund record
    await Payment.create({
      booking: booking._id,
      user: booking.guest,
      transactionId: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: refundAmount,
      paymentMethod: booking.paymentMethod,
      status: 'Refunded',
      notes: `Refund processed (${refundPercentage * 100}%): ${reason}`,
    });

    // Notify guest
    await Notification.create({
      recipient: booking.guest,
      title: 'Reservation Cancelled & Refunded',
      message: `Reservation ${booking.bookingReference} has been cancelled. A refund of $${refundAmount} has been credited.`,
      type: 'payment',
      link: '/guest/bookings',
    });

    // Activity log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOKING_CANCEL',
      category: 'Booking',
      details: `Cancelled booking ${booking.bookingReference}. Refund amount: $${refundAmount}`,
    });

    res.json({
      success: true,
      message: `Reservation cancelled successfully. Refund of $${refundAmount} processed.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
