import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Calendar,
  CheckCircle,
  Building2,
  Sparkles,
  ArrowRight,
  Clock,
  Printer,
} from 'lucide-react';

const BookingPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const checkInDate = searchParams.get('checkIn') || new Date().toISOString().split('T')[0];
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);
  const checkOutDate = searchParams.get('checkOut') || nextDay.toISOString().split('T')[0];
  const adults = Number(searchParams.get('adults')) || 2;
  const children = Number(searchParams.get('children')) || 0;

  const [specialRequests, setSpecialRequests] = useState('');

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Eleanor Vance');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}`);
      if (res.data.success) {
        setRoom(res.data.room);
      }
    } catch (err) {
      setError('Could not load room for booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!room) return { nights: 1, pricePerNight: 0, subtotal: 0, taxes: 0, serviceFee: 25, total: 0 };
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const pricePerNight = Math.round(room.pricePerNight * (room.seasonalPriceMultiplier || 1));
    const subtotal = pricePerNight * nights;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;
    const serviceFee = 25;
    const total = subtotal + taxes + serviceFee;
    return { nights, pricePerNight, subtotal, taxes, serviceFee, total };
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';

      const res = await api.post('/bookings', {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestsCount: { adults, children },
        specialRequests,
        paymentMethod: 'Credit Card',
        cardLast4: last4,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);

        // Fetch generated invoice
        const invRes = await api.get(`/payments/invoice/${res.data.booking._id}`);
        if (invRes.data.success) {
          setInvoiceData(invRes.data.invoice);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-60">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Preparing secure booking checkout...</p>
      </div>
    );
  }

  const { nights, pricePerNight, subtotal, taxes, serviceFee, total } = calculateTotals();

  // If Booking is confirmed, render Success Screen!
  if (bookingSuccess) {
    return (
      <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
        <div className="container" style={{ maxWidth: '750px' }}>
          <div className="card-custom p-5 text-center bg-white border-0 shadow-lg">
            <div
              className="mx-auto mb-4"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={48} />
            </div>

            <span className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill fw-bold text-uppercase mb-2">
              Payment & Reservation Confirmed
            </span>
            <h2 className="display-6 fw-bold text-dark mb-2">You're Checked Into HotelPro!</h2>
            <p className="text-muted mb-4">
              Thank you for choosing HotelPro. A confirmation summary and official digital receipt have been registered to your account.
            </p>

            <div className="bg-light p-4 rounded-3 text-start mb-4">
              <div className="row g-3">
                <div className="col-sm-6">
                  <small className="text-muted text-uppercase fw-bold">Booking Reference</small>
                  <div className="fs-5 fw-bold text-primary font-monospace">{bookingSuccess.bookingReference}</div>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted text-uppercase fw-bold">Room Assigned</small>
                  <div className="fs-5 fw-bold text-dark">#{room.roomNumber} ({room.category?.name})</div>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted text-uppercase fw-bold">Dates</small>
                  <div className="small text-dark">
                    {new Date(checkInDate).toLocaleDateString()} — {new Date(checkOutDate).toLocaleDateString()} ({nights} Nights)
                  </div>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted text-uppercase fw-bold">Total Paid</small>
                  <div className="fs-5 fw-bold text-success">${total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <button
                className="btn btn-navy d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowInvoiceModal(true)}
              >
                <Printer size={18} /> View & Print Invoice
              </button>
              <Link to="/guest/bookings" className="btn btn-luxury d-flex align-items-center justify-content-center gap-2">
                Go to My Reservations <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          invoice={invoiceData}
        />
      </div>
    );
  }

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '1050px' }}>
        {/* Header Title */}
        <div className="mb-4 text-center text-md-start">
          <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
            Instant Reservation
          </span>
          <h1 className="display-6 fw-bold text-dark mt-1">Confirm & Secure Your Stay</h1>
          <p className="text-muted">Review your reservation details and complete payment with 256-bit SSL encryption.</p>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="row g-4">
          {/* Left Form: Guest Info & Payment */}
          <div className="col-lg-7">
            <form onSubmit={handleBookingSubmit}>
              {/* Guest Profile Card */}
              <div className="card-custom p-4 mb-4">
                <h5 className="fw-bold text-dark mb-3">1. Guest Information</h5>

                {isAuthenticated ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Full Name</label>
                      <input type="text" className="form-control" value={user?.name || ''} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Email Address</label>
                      <input type="email" className="form-control" value={user?.email || ''} readOnly />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Special Requests / Preferences</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g., high floor preferred, extra pillows, airport arrival time..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded-3 text-center">
                    <p className="text-muted small mb-3">Please sign in to confirm this reservation.</p>
                    <Link to="/login" className="btn btn-sm btn-navy">
                      Sign In to Proceed
                    </Link>
                  </div>
                )}
              </div>

              {/* Payment Gateway Card */}
              <div className="card-custom p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <CreditCard size={20} className="text-warning" /> 2. Secure Payment Gateway
                  </h5>
                  <span className="badge bg-light text-muted border d-flex align-items-center gap-1">
                    <Lock size={12} className="text-success" /> 256-Bit SSL
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small text-muted mb-1">Card Number</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                      <span className="input-group-text bg-white">
                        <CreditCard size={18} className="text-muted" />
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Name on Card</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-3 col-6">
                    <label className="form-label small text-muted mb-1">Expiry</label>
                    <input
                      type="text"
                      className="form-control text-center font-monospace"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-3 col-6">
                    <label className="form-label small text-muted mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      className="form-control text-center font-monospace"
                      placeholder="CVC"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-light rounded-3 d-flex align-items-center gap-2 text-muted small">
                  <ShieldCheck size={18} className="text-success flex-shrink-0" />
                  <span>Test Card Pre-loaded: This simulated payment engine completes the transaction instantly without real bank charges.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !isAuthenticated}
                className="btn btn-luxury w-100 justify-content-center py-3 fs-5 shadow-lg"
              >
                {submitting ? 'Authorizing Payment...' : `Confirm & Pay $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Right Summary Sidebar */}
          <div className="col-lg-5">
            <div className="card-custom p-4 sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold text-dark mb-3">Booking Summary</h5>

              <div className="d-flex gap-3 mb-3 pb-3 border-bottom">
                <img
                  src={room?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                  alt={room?.category?.name}
                  className="rounded-3"
                  style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                />
                <div>
                  <span className="badge bg-warning text-dark small mb-1">{room?.category?.name}</span>
                  <h6 className="fw-bold text-dark mb-0">Room #{room?.roomNumber}</h6>
                  <small className="text-muted">Floor {room?.floor} • {room?.category?.bedType}</small>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-light p-3 rounded-3 mb-3 small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-in</span>
                  <strong className="text-dark">{new Date(checkInDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} (3:00 PM)</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-out</span>
                  <strong className="text-dark">{new Date(checkOutDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} (11:00 AM)</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Length</span>
                  <strong className="text-primary">{nights} Night(s)</strong>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="vstack gap-2 small mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">${pricePerNight} × {nights} nights</span>
                  <span className="text-dark fw-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Hotel & Occupancy Taxes (12%)</span>
                  <span className="text-dark">${taxes.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Resort & Service Fee</span>
                  <span className="text-dark">${serviceFee.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center fs-5 fw-bold text-dark">
                  <span>Total Due</span>
                  <span className="text-dark">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-muted small">
                Includes complimentary cancellation up to 48 hours before check-in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
