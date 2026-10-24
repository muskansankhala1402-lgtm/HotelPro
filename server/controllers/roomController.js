const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all rooms with filtering, search, pagination & availability check
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      status,
      adults,
      children,
      checkIn,
      checkOut,
      featured,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by status if specified
    if (status) {
      query.status = status;
    }

    // Filter featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Category filter
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await RoomCategory.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(category, 'i') }],
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Keyword search (room number or description)
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } },
      ];
    }

    let rooms = await Room.find(query)
      .populate('category')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    // Filter by guest capacity via populated category
    if (adults || children) {
      rooms = rooms.filter((room) => {
        const cat = room.category;
        if (!cat) return true;
        const matchesAdults = adults ? (cat.capacity?.adults || 2) >= Number(adults) : true;
        const matchesChildren = children ? (cat.capacity?.children || 1) >= Number(children) : true;
        return matchesAdults && matchesChildren;
      });
    }

    // If checkIn and checkOut dates are provided, check real-time availability
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      // Find all conflicting active bookings
      const conflictingBookings = await Booking.find({
        status: { $in: ['Confirmed', 'Checked-In'] },
        $or: [
          { checkInDate: { $lt: end }, checkOutDate: { $gt: start } },
        ],
      }).select('room');

      const bookedRoomIds = new Set(conflictingBookings.map((b) => b.room.toString()));

      // Tag availability or filter
      rooms = rooms.map((room) => {
        const isConflict = bookedRoomIds.has(room._id.toString());
        const roomObj = room.toObject();
        roomObj.isAvailableForDates = !isConflict && room.status === 'Available';
        return roomObj;
      });
    }

    res.json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('category');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Get recent approved reviews for this room
    const reviews = await Review.find({ room: room._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      room,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all room categories
// @route   GET /api/rooms/categories/all
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().sort('name');
    res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room category
// @route   POST /api/rooms/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private (Staff / Admin)
exports.createRoom = async (req, res, next) => {
  try {
    const { roomNumber, category, floor, pricePerNight, amenities, images, description, isFeatured } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists`,
      });
    }

    const room = await Room.create({
      roomNumber,
      category,
      floor: floor || 1,
      pricePerNight,
      amenities: amenities || ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
      images: images && images.length ? images : [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      ],
      description,
      isFeatured: !!isFeatured,
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ROOM_CREATE',
      category: 'Room',
      details: `Created Room #${room.roomNumber} (Floor ${room.floor}) at $${room.pricePerNight}/night`,
    });

    const populatedRoom = await Room.findById(room._id).populate('category');

    res.status(201).json({
      success: true,
      room: populatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Staff / Admin)
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category');

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ROOM_UPDATE',
      category: 'Room',
      details: `Updated details for Room #${room.roomNumber}`,
    });

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if room has active bookings
    const activeBooking = await Booking.findOne({
      room: room._id,
      status: { $in: ['Confirmed', 'Checked-In'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active reservations. Please cancel or reassign bookings first.',
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ROOM_DELETE',
      category: 'Room',
      details: `Deleted Room #${room.roomNumber}`,
    });

    res.json({
      success: true,
      message: `Room #${room.roomNumber} removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update seasonal pricing multiplier
// @route   POST /api/rooms/seasonal-pricing
// @access  Private (Admin)
exports.updateSeasonalPricing = async (req, res, next) => {
  try {
    const { multiplier, categoryId } = req.body;

    if (!multiplier || multiplier < 0.5 || multiplier > 3.0) {
      return res.status(400).json({
        success: false,
        message: 'Multiplier must be between 0.5 and 3.0',
      });
    }

    const query = categoryId ? { category: categoryId } : {};
    await Room.updateMany(query, { seasonalPriceMultiplier: multiplier });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SEASONAL_PRICING_UPDATE',
      category: 'Room',
      details: `Updated seasonal pricing multiplier to ${multiplier}x ${categoryId ? `for category ${categoryId}` : 'hotel-wide'}`,
    });

    res.json({
      success: true,
      message: `Seasonal pricing updated to ${multiplier}x successfully`,
    });
  } catch (error) {
    next(error);
  }
};
