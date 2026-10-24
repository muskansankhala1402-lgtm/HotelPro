import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Users,
  Maximize2,
  Calendar,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle,
} from 'lucide-react';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  // Booking Calculator States
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(nextDayStr);
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rooms/${id}`);
      if (res.data.success) {
        setRoom(res.data.room);
        setReviews(res.data.reviews || []);
        if (res.data.room.images && res.data.room.images.length > 0) {
          setSelectedImage(res.data.room.images[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pricing Calculation
  const calculatePricing = () => {
    if (!room) return { nights: 1, subtotal: 0, taxes: 0, serviceFee: 25, total: 0 };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const pricePerNight = Math.round(room.pricePerNight * (room.seasonalPriceMultiplier || 1));
    const subtotal = pricePerNight * nights;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;
    const serviceFee = 25;
    const total = subtotal + taxes + serviceFee;

    return { nights, pricePerNight, subtotal, taxes, serviceFee, total };
  };

  const handleProceedBooking = (e) => {
    e.preventDefault();
    navigate(`/booking/${room._id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewSuccess('');
    setReviewError('');

    try {
      const res = await api.post('/reviews', {
        roomId: room._id,
        rating: reviewRating,
        cleanlinessRating: reviewRating,
        comfortRating: reviewRating,
        serviceRating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your review has been submitted.');
        setReviewComment('');
        fetchRoomDetails();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-60">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h2>Room Not Found</h2>
        <Link to="/rooms" className="btn btn-navy mt-3">Back to Rooms</Link>
      </div>
    );
  }

  const { nights, pricePerNight, subtotal, taxes, serviceFee, total } = calculatePricing();

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 d-flex align-items-center gap-2">
          <Link to="/rooms" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <ArrowLeft size={14} /> Back to Rooms
          </Link>
          <span className="text-muted">/</span>
          <span className="text-muted">{room.category?.name}</span>
          <span className="text-muted">/</span>
          <span className="fw-bold text-dark">Room #{room.roomNumber}</span>
        </div>

        {/* Room Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <span className="badge bg-warning text-dark text-uppercase fw-bold px-2 py-1 mb-2">
              {room.category?.name || 'Exclusive Suite'}
            </span>
            <h1 className="display-6 fw-bold text-dark mb-1">
              Room #{room.roomNumber} - {room.category?.name}
            </h1>
            <p className="text-muted mb-0">Floor {room.floor} • {room.category?.bedType || 'King Bed'} • Up to {room.category?.capacity?.adults || 2} Adults</p>
          </div>

          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            <div className="text-md-end">
              <span className="text-muted small d-block">Starting from</span>
              <span className="display-6 fw-bold text-dark">${pricePerNight}</span>
              <span className="text-muted small"> / night</span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="row g-3 mb-5">
          <div className="col-lg-8">
            <img
              src={selectedImage || room.images?.[0]}
              alt={room.roomNumber}
              className="w-100 rounded-4 shadow-sm"
              style={{ height: '460px', objectFit: 'cover' }}
            />
          </div>
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3 h-100">
              {(room.images && room.images.length > 1 ? room.images : [
                room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
              ]).slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`w-100 rounded-3 cursor-pointer transition ${selectedImage === img ? 'border border-3 border-warning' : 'opacity-85'}`}
                  style={{ height: '140px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="row g-5">
          {/* Room Details & Amenities */}
          <div className="col-lg-7">
            {/* Overview */}
            <div className="card-custom p-4 mb-4">
              <h4 className="fw-bold mb-3">Room Overview</h4>
              <p className="text-secondary leading-relaxed">
                {room.description || room.category?.description || 'Indulge in unmatched relaxation. Designed for privacy, comfort, and sheer luxury with bespoke furnishings and modern intuitive amenities.'}
              </p>

              {/* Specs Pills */}
              <div className="row g-3 text-center mt-3 pt-3 border-top">
                <div className="col-sm-3 col-6">
                  <div className="p-3 bg-light rounded-3">
                    <Maximize2 size={20} className="text-warning mb-1" />
                    <div className="fw-bold small">{room.category?.sizeSqFt || 450} sq ft</div>
                    <small className="text-muted">Living Space</small>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-3 bg-light rounded-3">
                    <Users size={20} className="text-primary mb-1" />
                    <div className="fw-bold small">{room.category?.capacity?.adults || 2} Adults</div>
                    <small className="text-muted">Max Capacity</small>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-3 bg-light rounded-3">
                    <Sparkles size={20} className="text-success mb-1" />
                    <div className="fw-bold small">Floor {room.floor}</div>
                    <small className="text-muted">Building Level</small>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-3 bg-light rounded-3">
                    <Star size={20} className="text-warning mb-1" />
                    <div className="fw-bold small">{room.rating || 4.8} / 5.0</div>
                    <small className="text-muted">Guest Rating</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="card-custom p-4 mb-4">
              <h4 className="fw-bold mb-3">Featured Amenities</h4>
              <div className="row g-3">
                {(room.amenities || ['High-speed Wi-Fi', 'Smart TV 65"', 'Climate Control', 'Marble Bathroom', 'Mini Bar', 'Espresso Machine']).map((item, idx) => (
                  <div key={idx} className="col-sm-6 d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success flex-shrink-0" />
                    <span className="text-dark small fw-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Policy Notice */}
            <div className="card-custom p-4 mb-4 bg-white">
              <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> Hotel Policies & Guarantees
              </h5>
              <ul className="text-muted small mb-0 ps-3">
                <li className="mb-1"><strong>Check-In:</strong> 3:00 PM (Early check-in subject to availability)</li>
                <li className="mb-1"><strong>Check-Out:</strong> 11:00 AM (Express check-out via app available)</li>
                <li className="mb-1"><strong>Cancellation Policy:</strong> 100% refund if cancelled at least 48 hours prior to check-in.</li>
                <li><strong>Complimentary Perks:</strong> Free valet parking, high-speed Wi-Fi, and access to wellness cabanas.</li>
              </ul>
            </div>

            {/* Guest Reviews Section */}
            <div className="card-custom p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <MessageSquare size={20} className="text-warning" /> Guest Reviews ({reviews.length})
                </h4>
                <div className="d-flex align-items-center gap-1 text-warning fw-bold">
                  <Star size={18} fill="currentColor" />
                  <span>{room.rating || 4.8}</span>
                  <span className="text-muted small font-normal"> / 5.0</span>
                </div>
              </div>

              {/* Review Submission Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-3 bg-light rounded-3 mb-4">
                  <h6 className="fw-bold mb-2">Write a Guest Review</h6>
                  {reviewSuccess && <div className="alert alert-success py-2 small">{reviewSuccess}</div>}
                  {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}

                  <div className="mb-2">
                    <label className="form-label small text-muted mb-1">Your Rating</label>
                    <div className="d-flex gap-2 text-warning">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={22}
                          className="cursor-pointer"
                          fill={star <= reviewRating ? 'currentColor' : 'none'}
                          onClick={() => setReviewRating(star)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share your experience regarding cleanliness, comfort, and service..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" disabled={submittingReview} className="btn btn-sm btn-navy d-flex align-items-center gap-1">
                    <Send size={14} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-light rounded-3 text-center mb-4 text-muted small">
                  <Link to="/login" className="text-primary fw-bold">Sign in</Link> to share your review of this room.
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-muted text-center py-3 small">Be the first to review this suite!</p>
              ) : (
                <div className="vstack gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={rev.user?.name}
                            className="rounded-circle"
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="fw-bold mb-0 small text-dark">{rev.user?.name}</h6>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex text-warning">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>

                      <p className="text-secondary small mb-2">{rev.comment}</p>

                      {/* Staff Reply */}
                      {rev.staffReply?.message && (
                        <div className="p-2 bg-light rounded border-start border-3 border-warning mt-2 small">
                          <span className="fw-bold text-dark d-block">Hotel Response:</span>
                          <span className="text-muted">{rev.staffReply.message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Reservation Calculator Box */}
          <div className="col-lg-5">
            <div className="card-custom p-4 sticky-top shadow-lg" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-baseline pb-3 mb-3 border-bottom">
                <div>
                  <span className="fs-3 fw-bold text-dark">${pricePerNight}</span>
                  <span className="text-muted small"> / night</span>
                </div>
                <span className="badge badge-status-available">Available for Booking</span>
              </div>

              <form onSubmit={handleProceedBooking}>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">
                      <Calendar size={14} className="text-warning me-1 inline" /> Check-in
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkIn}
                      min={todayStr}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">
                      <Calendar size={14} className="text-warning me-1 inline" /> Check-out
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">Adults</label>
                    <select className="form-select" value={adults} onChange={(e) => setAdults(e.target.value)}>
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted mb-1">Children</label>
                    <select className="form-select" value={children} onChange={(e) => setChildren(e.target.value)}>
                      <option value="0">0 Children</option>
                      <option value="1">1 Child</option>
                      <option value="2">2 Children</option>
                    </select>
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="bg-light p-3 rounded-3 mb-4 small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">${pricePerNight} × {nights} night(s)</span>
                    <span className="text-dark fw-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Occupancy & State Tax (12%)</span>
                    <span className="text-dark">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Resort & Service Fee</span>
                    <span className="text-dark">${serviceFee.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center fs-5 fw-bold text-dark">
                    <span>Total Cost</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-luxury w-100 justify-content-center py-3 fs-5 shadow">
                  Reserve This Suite Now
                </button>

                <p className="text-center text-muted small mt-3 mb-0">
                  <ShieldCheck size={14} className="text-success me-1 inline" />
                  No immediate charge until confirmation step.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
