import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';
import {
  CalendarCheck,
  Coffee,
  Printer,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Send,
  BedDouble,
  DollarSign,
} from 'lucide-react';

const GuestDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Cancellation State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Service Request Form State
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [serviceType, setServiceType] = useState('Room Cleaning');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePriority, setServicePriority] = useState('Medium');
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceMessage, setServiceMessage] = useState('');

  useEffect(() => {
    fetchGuestData();
  }, []);

  const fetchGuestData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/services/my-requests'),
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings || []);
        if (bookingsRes.data.bookings.length > 0) {
          setSelectedRoomId(bookingsRes.data.bookings[0].room?._id || '');
        }
      }
      if (servicesRes.data.success) {
        setServiceRequests(servicesRes.data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async (bookingId) => {
    try {
      const res = await api.get(`/payments/invoice/${bookingId}`);
      if (res.data.success) {
        setSelectedInvoice(res.data.invoice);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    setCancelLoading(true);

    try {
      const res = await api.post(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: cancelReason || 'Cancelled at guest request',
      });
      if (res.data.success) {
        setCancellingBooking(null);
        setCancelReason('');
        fetchGuestData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert('Please select a room for your service request.');
      return;
    }

    setServiceSubmitting(true);
    setServiceMessage('');

    try {
      const res = await api.post('/services', {
        roomId: selectedRoomId,
        serviceType,
        description: serviceDesc,
        priority: servicePriority,
      });

      if (res.data.success) {
        setServiceMessage('Service request submitted! Hotel staff has been dispatched.');
        setServiceDesc('');
        fetchGuestData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setServiceSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge bg-primary">Confirmed</span>;
      case 'Checked-In':
        return <span className="badge bg-success">Checked-In</span>;
      case 'Checked-Out':
        return <span className="badge bg-secondary">Checked-Out</span>;
      case 'Cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="card-custom p-4 mb-4 bg-white border-0 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="rounded-circle"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
              <div>
                <span className="badge bg-warning text-dark text-uppercase small mb-1">Guest Portal</span>
                <h3 className="fw-bold mb-0 text-dark">Welcome back, {user?.name}</h3>
                <small className="text-muted">{user?.email}</small>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link to="/rooms" className="btn btn-luxury btn-sm">
                Book Another Room
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('bookings')}
            >
              <CalendarCheck size={18} /> My Reservations ({bookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold d-flex align-items-center gap-2 ${activeTab === 'services' ? 'active bg-primary' : 'text-dark'}`}
              onClick={() => setActiveTab('services')}
            >
              <Coffee size={18} /> In-Room Services & Requests ({serviceRequests.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Bookings & Reservations */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="card-custom p-5 text-center bg-white">
                <BedDouble size={48} className="text-muted mx-auto mb-3" />
                <h4 className="fw-bold text-dark">No Reservations Found</h4>
                <p className="text-muted mb-4">You have not reserved any rooms yet. Plan your luxury getaway today!</p>
                <Link to="/rooms" className="btn btn-luxury">Browse Available Suites</Link>
              </div>
            ) : (
              <div className="vstack gap-4">
                {bookings.map((b) => (
                  <div key={b._id} className="card-custom p-4 bg-white border-0 shadow-sm">
                    <div className="row g-4 align-items-center">
                      <div className="col-md-3">
                        <img
                          src={b.room?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                          alt={b.room?.category?.name}
                          className="w-100 rounded-3"
                          style={{ height: '140px', objectFit: 'cover' }}
                        />
                      </div>

                      <div className="col-md-5">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="text-warning text-uppercase fw-bold small">
                            {b.room?.category?.name}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>

                        <h5 className="fw-bold text-dark mb-1">
                          Room #{b.room?.roomNumber} (Ref: {b.bookingReference})
                        </h5>

                        <p className="text-muted small mb-2">
                          <Clock size={14} className="me-1 inline" />
                          Check-in: <strong>{new Date(b.checkInDate).toLocaleDateString()}</strong> • Check-out: <strong>{new Date(b.checkOutDate).toLocaleDateString()}</strong> ({b.totalNights} Nights)
                        </p>

                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>Total Paid: <strong className="text-success">${b.totalAmount}</strong></span>
                          <span>•</span>
                          <span>Method: {b.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="col-md-4 text-md-end">
                        <div className="d-flex flex-wrap justify-content-md-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                            onClick={() => handleOpenInvoice(b._id)}
                          >
                            <Printer size={14} /> View Invoice
                          </button>

                          {['Confirmed', 'Pending'].includes(b.status) && (
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              onClick={() => setCancellingBooking(b)}
                            >
                              <XCircle size={14} /> Cancel & Refund
                            </button>
                          )}
                        </div>
                        {b.cancellationReason && (
                          <div className="mt-2 text-danger small">
                            Reason: {b.cancellationReason} (Refund: ${b.refundAmount})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: In-Room Services */}
        {activeTab === 'services' && (
          <div className="row g-4">
            {/* Form */}
            <div className="col-lg-5">
              <div className="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <PlusCircle size={20} className="text-warning" /> Request Guest Service
                </h5>
                <p className="text-muted small mb-3">
                  Need fresh towels, food service, or an airport shuttle? Submit a request and our staff will attend to you promptly.
                </p>

                {serviceMessage && <div className="alert alert-success py-2 small">{serviceMessage}</div>}

                <form onSubmit={handleServiceSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Select Your Room</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Room --</option>
                      {bookings.map((b) => (
                        <option key={b.room?._id} value={b.room?._id}>
                          Room #{b.room?.roomNumber} ({b.room?.category?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Service Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option value="Room Cleaning">Room Cleaning</option>
                      <option value="Extra Towels & Linens">Extra Towels & Linens</option>
                      <option value="Food & Beverage">Food & Beverage (Room Service)</option>
                      <option value="Luggage Assistance">Luggage Assistance</option>
                      <option value="Maintenance & Repair">Maintenance & Repair</option>
                      <option value="Airport Shuttle">Airport Shuttle</option>
                      <option value="Wake-up Call">Wake-up Call</option>
                      <option value="Concierge / Other">Concierge / Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Priority</label>
                    <select
                      className="form-select form-select-sm"
                      value={servicePriority}
                      onChange={(e) => setServicePriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Details / Instructions</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Specify your request (e.g. 2 extra bath sheets, club sandwich at 7:30 PM)..."
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={serviceSubmitting || !selectedRoomId}
                    className="btn btn-luxury w-100 justify-content-center btn-sm"
                  >
                    <Send size={16} /> {serviceSubmitting ? 'Dispatching...' : 'Submit Request'}
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="col-lg-7">
              <div className="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 className="fw-bold text-dark mb-3">Active & Past Service Requests</h5>
                {serviceRequests.length === 0 ? (
                  <p className="text-muted text-center py-4 small">No service requests placed yet.</p>
                ) : (
                  <div className="vstack gap-3">
                    {serviceRequests.map((req) => (
                      <div key={req._id} className="p-3 border rounded-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark">{req.serviceType}</span>
                          <span
                            className={`badge ${
                              req.status === 'Completed'
                                ? 'bg-success'
                                : req.status === 'In-Progress'
                                ? 'bg-warning text-dark'
                                : 'bg-secondary'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">{req.description}</p>
                        <div className="d-flex justify-content-between text-muted small" style={{ fontSize: '0.75rem' }}>
                          <span>Room #{req.room?.roomNumber} • Priority: {req.priority}</span>
                          <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingBooking && (
          <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <AlertCircle size={20} /> Cancel Reservation {cancellingBooking.bookingReference}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setCancellingBooking(null)}></button>
                </div>
                <form onSubmit={handleCancelBooking}>
                  <div className="modal-body p-4">
                    <p className="text-dark small mb-3">
                      Are you sure you wish to cancel this reservation for Room #{cancellingBooking.room?.roomNumber}?
                    </p>
                    <div className="alert alert-warning small">
                      <strong>Refund Policy:</strong> Reservations cancelled &gt; 48 hours prior receive a <strong>100% refund</strong>. Cancellations within 48 hours receive an <strong>80% refund</strong>.
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Reason for Cancellation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., flight cancelled, change of travel dates..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCancellingBooking(null)}>
                      Keep Reservation
                    </button>
                    <button type="submit" disabled={cancelLoading} className="btn btn-danger btn-sm">
                      {cancelLoading ? 'Processing Refund...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        <InvoiceModal
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          invoice={selectedInvoice}
        />
      </div>
    </div>
  );
};

export default GuestDashboard;
