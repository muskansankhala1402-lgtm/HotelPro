const Booking = require('../models/Booking');
const Room = require('../models/Room');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Process Guest Check-In
// @route   POST /api/staff/check-in/:bookingId
// @access  Private (Staff / Admin)
exports.checkInGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room guest');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in booking with status '${booking.status}'. Must be 'Confirmed'.`,
      });
    }

    booking.status = 'Checked-In';
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user._id;
    await booking.save();

    // Update Room status to 'Occupied'
    await Room.findByIdAndUpdate(booking.room._id, {
      status: 'Occupied',
      housekeepingStatus: 'Inspected',
    });

    // Notify guest
    await Notification.create({
      recipient: booking.guest._id,
      title: 'Welcome to HotelPro!',
      message: `You have successfully checked into Room #${booking.room.roomNumber}. Enjoy your stay!`,
      type: 'booking',
      link: '/guest/services',
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GUEST_CHECKIN',
      category: 'Staff',
      details: `Checked in guest ${booking.guest.name} to Room #${booking.room.roomNumber} (Ref: ${booking.bookingReference})`,
    });

    res.json({
      success: true,
      message: `Guest ${booking.guest.name} checked into Room #${booking.room.roomNumber} successfully!`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Guest Check-Out
// @route   POST /api/staff/check-out/:bookingId
// @access  Private (Staff / Admin)
exports.checkOutGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room guest');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Checked-In') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out booking with status '${booking.status}'. Must be 'Checked-In'.`,
      });
    }

    booking.status = 'Checked-Out';
    booking.checkedOutAt = new Date();
    booking.checkedOutBy = req.user._id;
    await booking.save();

    // Update Room status to 'Cleaning' and housekeeping to 'Dirty'
    await Room.findByIdAndUpdate(booking.room._id, {
      status: 'Cleaning',
      housekeepingStatus: 'Dirty',
    });

    // Automatically generate Housekeeping Service Task
    await ServiceRequest.create({
      guest: booking.guest._id,
      room: booking.room._id,
      booking: booking._id,
      serviceType: 'Room Cleaning',
      description: `Post-checkout turnover cleaning for Room #${booking.room.roomNumber}`,
      priority: 'High',
      status: 'Pending',
    });

    // Notify guest and invite review
    await Notification.create({
      recipient: booking.guest._id,
      title: 'Thank you for staying with us!',
      message: `You have checked out of Room #${booking.room.roomNumber}. Please leave a review of your experience.`,
      type: 'booking',
      link: `/rooms/${booking.room._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GUEST_CHECKOUT',
      category: 'Staff',
      details: `Checked out guest ${booking.guest.name} from Room #${booking.room.roomNumber}`,
    });

    res.json({
      success: true,
      message: `Guest ${booking.guest.name} checked out. Room #${booking.room.roomNumber} queued for housekeeping.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Room Housekeeping & Maintenance Status
// @route   PUT /api/staff/rooms/:roomId/housekeeping
// @access  Private (Staff / Admin)
exports.updateHousekeeping = async (req, res, next) => {
  try {
    const { housekeepingStatus, notes } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.housekeepingStatus = housekeepingStatus;

    // If cleaned and inspected, and not currently occupied, set status back to Available
    if (['Clean', 'Inspected'].includes(housekeepingStatus) && room.status === 'Cleaning') {
      room.status = 'Available';
    }

    await room.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'HOUSEKEEPING_UPDATE',
      category: 'Staff',
      details: `Room #${room.roomNumber} housekeeping updated to '${housekeepingStatus}' (${room.status})`,
    });

    res.json({
      success: true,
      message: `Room #${room.roomNumber} status updated to ${housekeepingStatus}`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Staff Overview Dashboard Data
// @route   GET /api/staff/overview
// @access  Private (Staff / Admin)
exports.getStaffOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todaysCheckIns,
      todaysCheckOuts,
      occupiedRooms,
      cleaningRooms,
      pendingRequests,
      activeBookings,
    ] = await Promise.all([
      Booking.countDocuments({
        status: 'Confirmed',
        checkInDate: { $gte: today, $lt: tomorrow },
      }),
      Booking.countDocuments({
        status: 'Checked-In',
        checkOutDate: { $gte: today, $lt: tomorrow },
      }),
      Room.countDocuments({ status: 'Occupied' }),
      Room.countDocuments({ status: { $in: ['Cleaning', 'Maintenance'] } }),
      ServiceRequest.countDocuments({ status: { $in: ['Pending', 'In-Progress'] } }),
      Booking.find({ status: { $in: ['Confirmed', 'Checked-In'] } })
        .populate('guest', 'name phone email')
        .populate({ path: 'room', populate: { path: 'category' } })
        .sort('checkInDate')
        .limit(10),
    ]);

    res.json({
      success: true,
      overview: {
        todaysCheckIns,
        todaysCheckOuts,
        occupiedRooms,
        cleaningRooms,
        pendingRequests,
        activeBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
