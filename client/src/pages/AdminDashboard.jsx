import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  Users,
  BedDouble,
  Activity,
  PlusCircle,
  Sliders,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Add Room Modal State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [newRoomPrice, setNewRoomPrice] = useState('350');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  // Seasonal Pricing Multiplier State
  const [multiplier, setMultiplier] = useState('1.2');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, roomsRes, categoriesRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/rooms'),
        api.get('/rooms/categories/all'),
        api.get('/admin/activity-logs'),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
      if (usersRes.data.success) setUsersList(usersRes.data.users || []);
      if (roomsRes.data.success) setRoomsList(roomsRes.data.rooms || []);
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.categories || []);
        if (categoriesRes.data.categories.length > 0) {
          setNewRoomCategory(categoriesRes.data.categories[0]._id);
        }
      }
      if (logsRes.data.success) setActivityLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update User Role / Status
  const handleUpdateUser = async (userId, updatePayload) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, updatePayload);
      if (res.data.success) {
        setFeedbackMsg(`User ${res.data.user.email} updated successfully!`);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Add New Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', {
        roomNumber: newRoomNumber,
        category: newRoomCategory,
        floor: Number(newRoomFloor),
        pricePerNight: Number(newRoomPrice),
        description: newRoomDesc,
      });

      if (res.data.success) {
        setShowAddRoomModal(false);
        setFeedbackMsg(`Room #${newRoomNumber} added to inventory!`);
        setNewRoomNumber('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to remove Room #${roomNumber} from inventory?`)) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove room');
    }
  };

  // Apply Seasonal Multiplier
  const handleUpdateMultiplier = async () => {
    try {
      const res = await api.post('/rooms/seasonal-pricing', {
        multiplier: Number(multiplier),
      });
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update seasonal pricing');
    }
  };

  const stats = analytics?.stats || {};
  const charts = analytics?.charts || {};

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Admin Header */}
        <div className="card-custom p-4 mb-4 bg-dark text-white border-0 shadow">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="badge bg-warning text-dark text-uppercase small mb-1">
                  Executive Suite
                </span>
                <h3 className="fw-bold mb-0 text-white">Administrator Command Center</h3>
                <small className="text-secondary">Logged in as {user?.name} (Master Administrator)</small>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" onClick={fetchAdminData}>
                <RefreshCw size={14} /> Refresh Data
              </button>
              <button className="btn btn-luxury btn-sm d-flex align-items-center gap-1" onClick={() => setShowAddRoomModal(true)}>
                <PlusCircle size={14} /> Add Room
              </button>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <CheckCircle size={16} className="me-2 inline" />
            {feedbackMsg}
            <button type="button" className="btn-close" onClick={() => setFeedbackMsg('')}></button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-success bg-opacity-10 text-success">
                <DollarSign size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">${stats.totalRevenue?.toLocaleString() || '0'}</div>
                <small className="text-muted">Total Revenue</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                <TrendingUp size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{stats.occupancyRate || 0}%</div>
                <small className="text-muted">Occupancy Rate</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                <Activity size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{stats.totalBookings || 0}</div>
                <small className="text-muted">Total Reservations</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-6">
            <div className="stat-card">
              <div className="stat-icon bg-info bg-opacity-10 text-info">
                <BedDouble size={28} />
              </div>
              <div>
                <div className="fs-3 fw-bold text-dark">{stats.totalRooms || 0} Rooms</div>
                <small className="text-muted">{stats.availableRooms || 0} Available Now</small>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'analytics' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics & Financial Reports
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'rooms' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('rooms')}
            >
              Room Inventory ({roomsList.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'users' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('users')}
            >
              User & Staff Directory ({usersList.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'logs' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('logs')}
            >
              System Security & Audit Trail
            </button>
          </li>
        </ul>

        {/* Tab 1: Charts & Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <div className="row g-4 mb-4">
              {/* Monthly Revenue Trend */}
              <div className="col-lg-8">
                <div className="card-custom p-4 bg-white border-0 shadow-sm h-100">
                  <h5 className="fw-bold text-dark mb-1">Monthly Revenue Performance</h5>
                  <p className="text-muted small mb-4">Gross booking revenue trajectory across past 6 operating months</p>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={charts.monthlyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#d97706" fill="#fef3c7" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Room Status Breakdown */}
              <div className="col-lg-4">
                <div className="card-custom p-4 bg-white border-0 shadow-sm h-100">
                  <h5 className="fw-bold text-dark mb-1">Room Inventory Status</h5>
                  <p className="text-muted small mb-3">Live distribution of all property units</p>
                  <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={charts.roomStatusBreakdown || []}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(charts.roomStatusBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-muted small mt-2">
                    Occupancy: <strong>{stats.occupancyRate}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Categories Bar Chart */}
            <div className="card-custom p-4 bg-white border-0 shadow-sm mb-4">
              <h5 className="fw-bold text-dark mb-1">Reservations by Room Category</h5>
              <p className="text-muted small mb-4">Demand distribution across suites and villa tiers</p>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={charts.categoryStats || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Room Inventory Management */}
        {activeTab === 'rooms' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            {/* Seasonal Pricing Controls */}
            <div className="p-3 bg-light rounded-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  <Sliders size={18} className="text-warning" /> Dynamic Seasonal Pricing Control
                </h6>
                <small className="text-muted">Adjust hotel-wide rate multiplier for peak holidays or off-season discounts.</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm w-auto"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                >
                  <option value="0.8">0.8x (Off-Season / 20% Discount)</option>
                  <option value="1.0">1.0x (Standard Base Rates)</option>
                  <option value="1.2">1.2x (Weekend Surge / 20% Increase)</option>
                  <option value="1.5">1.5x (Peak Holiday / 50% Surge)</option>
                  <option value="2.0">2.0x (High Festival Peak / Double)</option>
                </select>
                <button className="btn btn-sm btn-navy text-nowrap" onClick={handleUpdateMultiplier}>
                  Apply Multiplier
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Hotel Rooms Directory</h5>
              <button className="btn btn-luxury btn-sm" onClick={() => setShowAddRoomModal(true)}>
                <PlusCircle size={14} className="me-1 inline" /> Add New Unit
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Room #</th>
                    <th>Category</th>
                    <th>Floor</th>
                    <th>Base Rate</th>
                    <th>Current Rate</th>
                    <th>Status</th>
                    <th>Housekeeping</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsList.map((room) => {
                    const currentPrice = Math.round(room.pricePerNight * (room.seasonalPriceMultiplier || 1));
                    return (
                      <tr key={room._id}>
                        <td>
                          <strong>#{room.roomNumber}</strong>
                        </td>
                        <td>{room.category?.name}</td>
                        <td>Floor {room.floor}</td>
                        <td>${room.pricePerNight}</td>
                        <td>
                          <strong className="text-dark">${currentPrice}</strong>
                          {room.seasonalPriceMultiplier !== 1 && (
                            <small className="text-warning ms-1">({room.seasonalPriceMultiplier}x)</small>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              room.status === 'Available'
                                ? 'bg-success'
                                : room.status === 'Occupied'
                                ? 'bg-primary'
                                : room.status === 'Cleaning'
                                ? 'bg-warning text-dark'
                                : 'bg-danger'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {room.housekeepingStatus || 'Clean'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: User & Staff Management */}
        {activeTab === 'users' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            <h5 className="fw-bold mb-3">System User & Staff Governance</h5>
            <p className="text-muted small mb-4">
              Manage permissions, promote guests to staff or administrators, and toggle active credentials.
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Current Role</th>
                    <th>Department</th>
                    <th>Account Status</th>
                    <th className="text-end">Role Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={u.name}
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <span className="fw-bold text-dark">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'bg-danger'
                              : u.role === 'staff'
                              ? 'bg-info text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{u.department || 'N/A'}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-success' : 'btn-outline-danger'}`}
                          onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm w-auto d-inline-block"
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                        >
                          <option value="guest">Guest</option>
                          <option value="staff">Hotel Staff</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Trail */}
        {activeTab === 'logs' && (
          <div className="card-custom p-4 bg-white border-0 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={20} className="text-warning" /> Security & Activity Audit Trail
            </h5>
            <p className="text-muted small mb-4">
              Real-time audit records tracking logins, reservations, check-ins, rate updates, and staff actions.
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Category</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-muted font-monospace">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="fw-bold text-dark">{log.userName}</td>
                      <td>
                        <span className="badge bg-secondary">{log.userRole}</span>
                      </td>
                      <td>
                        <strong className="text-primary">{log.action}</strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{log.category}</span>
                      </td>
                      <td className="text-muted">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Room Modal */}
        {showAddRoomModal && (
          <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <PlusCircle size={20} className="text-warning" /> Add New Hotel Room
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddRoomModal(false)}></button>
                </div>
                <form onSubmit={handleCreateRoom}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Room Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., 405 or PH-1003"
                          value={newRoomNumber}
                          onChange={(e) => setNewRoomNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Floor Level</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max="50"
                          value={newRoomFloor}
                          onChange={(e) => setNewRoomFloor(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Room Category</label>
                        <select
                          className="form-select"
                          value={newRoomCategory}
                          onChange={(e) => setNewRoomCategory(e.target.value)}
                          required
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Base Price / Night ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="50"
                          step="10"
                          value={newRoomPrice}
                          onChange={(e) => setNewRoomPrice(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Room Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Room highlights, view, layout features..."
                          value={newRoomDesc}
                          onChange={(e) => setNewRoomDesc(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddRoomModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-luxury btn-sm">
                      Create & Publish Room
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
