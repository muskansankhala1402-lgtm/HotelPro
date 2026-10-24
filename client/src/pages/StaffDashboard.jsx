import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  CheckCircle,
  LogOut,
  Sparkles,
  Search,
  Bell,
  RefreshCw,
  Users,
  BedDouble,
  Clock,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('frontdesk');
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [overviewRes, bookingsRes, roomsRes, servicesRes] = await Promise.all([
        api.get('/staff/overview'),
        api.get('/bookings'),
        api.get('/rooms'),
        api.get('/services'),
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.overview);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings || []);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms || []);
      if (servicesRes.data.success) setServiceRequests(servicesRes.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check-In Guest
  const handleCheckIn = async (bookingId) => {
    try {
      const res = await api.post(`/staff/check-in/${bookingId}`);
      if (res.data.success) {
        setActionMessage(res.data.message);
        fetchStaffData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  // Check-Out Guest
  const handleCheckOut = async (bookingId) => {
    try {
      const res = await api.post(`/staff/check-out/${bookingId}`);
      if (res.data.success) {
        setActionMessage(res.data.message);
        fetchStaffData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  // Update Housekeeping Status
  const handleHousekeepingChange = async (roomId, newStatus) => {
    try {
      const res = await api.put(`/staff/rooms/${roomId}/housekeeping`, {
        housekeepingStatus: newStatus,
      });
      if (res.data.success) {
        setActionMessage(`Room #${res.data.room?.roomNumber} status updated to ${newStatus}`);
        fetchStaffData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complete Service Request
  const handleCompleteService = async (serviceId) => {
    try {
      const res = await api.put(`/services/${serviceId}`, {
        status: 'Completed',
        resolutionNotes: 'Completed by staff',
      });
      if (res.data.success) {
        setActionMessage('Service request marked as Completed!');
        fetchStaffData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.guest?.name?.toLowerCase().includes(q) ||
      b.room?.roomNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Staff Desk Header */}
        <div className="card-custom p-4 mb-4 bg-white border-0 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Compass size={32} />
              </div>
              <div>
                <span className="badge bg-info text-white text-uppercase small mb-1">
                  Staff Console • {user?.department || 'Front Desk'}
                </span>
                <h3 className="fw-bold mb-0 text-dark">Front Desk & Hotel Operations</h3>
                <small className="text-muted">Staff Operator: {user?.name} ({user?.email})</small>
              </div>
            </div>

            <button className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1" onClick={fetchStaffData}>
              <RefreshCw size={14} /> Refresh Operations
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <CheckCircle size={16} className="me-2 inline" />
            {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
          </div>
        )}

        {/* Operational Metrics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                <CheckCircle size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{overview?.todaysCheckIns || 0}</div>
                <small className="text-muted">Arrivals Today</small>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                <LogOut size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{overview?.todaysCheckOuts || 0}</div>
                <small className="text-muted">Departures Today</small>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-info bg-opacity-10 text-info">
                <BedDouble size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{overview?.occupiedRooms || 0}</div>
                <small className="text-muted">Occupied Rooms</small>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                <Bell size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{overview?.pendingRequests || 0}</div>
                <small className="text-muted">Pending Requests</small>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'frontdesk' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('frontdesk')}
            >
              Arrivals & Departures Check-In Desk
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'housekeeping' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('housekeeping')}
            >
              Housekeeping Board ({rooms.length} Rooms)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'services' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('services')}
            >
              Guest Service Requests ({serviceRequests.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Front Desk Check-in / Check-out Desk */}
        {activeTab === 'frontdesk' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
              <h5 className="fw-bold mb-0">Active Guest Reservations</h5>
              <div className="input-group" style={{ maxWidth: '300px' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search guest, ref, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="input-group-text bg-white">
                  <Search size={14} className="text-muted" />
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Booking Ref</th>
                    <th>Guest</th>
                    <th>Room Assigned</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th className="text-end">Front Desk Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <strong className="text-primary font-monospace">{b.bookingReference}</strong>
                        <div className="text-muted small">${b.totalAmount} • {b.paymentStatus}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{b.guest?.name}</div>
                        <div className="text-muted small">{b.guest?.phone || b.guest?.email}</div>
                      </td>
                      <td>
                        <span className="badge bg-dark">Room #{b.room?.roomNumber}</span>
                        <div className="text-muted small">{b.room?.category?.name}</div>
                      </td>
                      <td>
                        <div className="small">In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                        <div className="small text-muted">Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === 'Checked-In'
                              ? 'bg-success'
                              : b.status === 'Confirmed'
                              ? 'bg-primary'
                              : b.status === 'Checked-Out'
                              ? 'bg-secondary'
                              : 'bg-danger'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {b.status === 'Confirmed' && (
                          <button
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                            onClick={() => handleCheckIn(b._id)}
                          >
                            <CheckCircle size={14} /> Check In
                          </button>
                        )}

                        {b.status === 'Checked-In' && (
                          <button
                            className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1 text-dark"
                            onClick={() => handleCheckOut(b._id)}
                          >
                            <LogOut size={14} /> Process Check Out
                          </button>
                        )}

                        {['Checked-Out', 'Cancelled'].includes(b.status) && (
                          <span className="text-muted small">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Housekeeping Board */}
        {activeTab === 'housekeeping' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            <h5 className="fw-bold mb-3">Housekeeping & Room Turnover Tracker</h5>
            <p className="text-muted small mb-4">
              Real-time room readiness. Update room turnover status with 1 click to release clean rooms for incoming guests.
            </p>

            <div className="row g-4">
              {rooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <div className="border rounded-3 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Room #{room.roomNumber}</h5>
                        <small className="text-muted">Floor {room.floor} • {room.category?.name}</small>
                      </div>
                      <span
                        className={`badge ${
                          room.status === 'Occupied'
                            ? 'bg-primary'
                            : room.status === 'Cleaning'
                            ? 'bg-warning text-dark'
                            : room.status === 'Maintenance'
                            ? 'bg-danger'
                            : 'bg-success'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Housekeeping Status:</small>
                      <select
                        className="form-select form-select-sm fw-bold"
                        value={room.housekeepingStatus || 'Clean'}
                        onChange={(e) => handleHousekeepingChange(room._id, e.target.value)}
                      >
                        <option value="Clean">Clean (Ready for Inspection)</option>
                        <option value="Inspected">Inspected (Available for Guest)</option>
                        <option value="In-Progress">In-Progress (Cleaning Now)</option>
                        <option value="Dirty">Dirty (Needs Turnover)</option>
                      </select>
                    </div>

                    <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                      <span>Daily Rate: ${room.pricePerNight}</span>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleHousekeepingChange(room._id, 'Inspected')}
                      >
                        <Sparkles size={12} className="me-1 inline" /> Mark Ready
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Guest Service Requests */}
        {activeTab === 'services' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            <h5 className="fw-bold mb-3">Guest Service Dispatch Board</h5>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Guest</th>
                    <th>Service Type</th>
                    <th>Instructions</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <strong>Room #{req.room?.roomNumber}</strong>
                      </td>
                      <td>
                        <div className="fw-bold">{req.guest?.name}</div>
                        <small className="text-muted">{req.guest?.phone}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{req.serviceType}</span>
                      </td>
                      <td>
                        <small className="text-secondary">{req.description}</small>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            req.priority === 'Urgent'
                              ? 'bg-danger'
                              : req.priority === 'High'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            req.status === 'Completed'
                              ? 'bg-success'
                              : req.status === 'In-Progress'
                              ? 'bg-info'
                              : 'bg-secondary'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {req.status !== 'Completed' ? (
                          <button
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                            onClick={() => handleCompleteService(req._id)}
                          >
                            <CheckSquare size={14} /> Mark Resolved
                          </button>
                        ) : (
                          <span className="text-success small fw-bold">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
