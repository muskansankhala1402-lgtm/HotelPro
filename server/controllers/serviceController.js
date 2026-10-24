const ServiceRequest = require('../models/ServiceRequest');
const Room = require('../models/Room');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a new guest service request
// @route   POST /api/services
// @access  Private (Guest / Staff / Admin)
exports.createServiceRequest = async (req, res, next) => {
  try {
    const { roomId, bookingId, serviceType, description, priority = 'Medium' } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const serviceRequest = await ServiceRequest.create({
      guest: req.user._id,
      room: room._id,
      booking: bookingId || undefined,
      serviceType,
      description,
      priority,
      status: 'Pending',
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SERVICE_REQUEST_CREATE',
      category: 'Staff',
      details: `Service request created for Room #${room.roomNumber}: ${serviceType}`,
    });

    const populated = await ServiceRequest.findById(serviceRequest._id)
      .populate('guest', 'name phone email')
      .populate('room', 'roomNumber floor');

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      serviceRequest: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service requests (Staff / Admin)
// @route   GET /api/services
// @access  Private (Staff / Admin)
exports.getAllServiceRequests = async (req, res, next) => {
  try {
    const { status, priority, serviceType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (serviceType) query.serviceType = serviceType;

    const requests = await ServiceRequest.find(query)
      .populate('guest', 'name phone email')
      .populate('room', 'roomNumber floor')
      .populate('assignedStaff', 'name email department')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's service requests
// @route   GET /api/services/my-requests
// @access  Private (Guest)
exports.getMyServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ guest: req.user._id })
      .populate('room', 'roomNumber floor')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status or assignment
// @route   PUT /api/services/:id
// @access  Private (Staff / Admin)
exports.updateServiceRequest = async (req, res, next) => {
  try {
    const { status, assignedStaff, resolutionNotes } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (status) request.status = status;
    if (assignedStaff) request.assignedStaff = assignedStaff;
    if (resolutionNotes !== undefined) request.resolutionNotes = resolutionNotes;
    if (status === 'Completed') request.completedAt = new Date();

    await request.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SERVICE_REQUEST_UPDATE',
      category: 'Staff',
      details: `Service request ${request._id} updated to status '${request.status}'`,
    });

    const updated = await ServiceRequest.findById(request._id)
      .populate('guest', 'name phone email')
      .populate('room', 'roomNumber floor')
      .populate('assignedStaff', 'name email department');

    res.json({
      success: true,
      message: 'Service request updated successfully',
      serviceRequest: updated,
    });
  } catch (error) {
    next(error);
  }
};
