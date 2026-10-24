import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import {
  Calendar,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  Coffee,
  Wifi,
  Waves,
  Award,
  ChevronRight,
  Star,
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Search Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [category, setCategory] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, catRes] = await Promise.all([
          api.get('/rooms?featured=true'),
          api.get('/rooms/categories/all'),
        ]);

        if (roomsRes.data.success) {
          setFeaturedRooms(roomsRes.data.rooms.slice(0, 3));
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (checkIn) query.append('checkIn', checkIn);
    if (checkOut) query.append('checkOut', checkOut);
    if (category) query.append('category', category);
    if (guests) query.append('adults', guests);

    navigate(`/rooms?${query.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient position-relative">
        <div className="container py-lg-4">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3 shadow-sm" style={{ letterSpacing: '1px' }}>
                <Sparkles size={14} className="me-1 inline" /> Exceptional Luxury Hospitality
              </span>
              <h1 className="display-3 fw-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Your Ultimate Hotel Management & Luxury Stay Solution
              </h1>
              <p className="lead text-white-50 mb-5 fs-5">
                Experience seamless reservations, real-time availability tracking, intuitive guest services, and world-class suites tailored for perfection.
              </p>
            </div>
          </div>

          {/* Quick Booking Search Bar */}
          <div className="search-box mx-auto" style={{ maxWidth: '1050px' }}>
            <form onSubmit={handleSearchSubmit} className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1 mb-1">
                  <Calendar size={14} className="text-warning" /> Check-in Date
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

              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1 mb-1">
                  <Calendar size={14} className="text-warning" /> Check-out Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1 mb-1">
                  <Users size={14} className="text-warning" /> Guests
                </label>
                <select className="form-select" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4+ Adults</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-muted mb-1">
                  Category
                </label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <button type="submit" className="btn btn-luxury w-100 justify-content-center py-2">
                  <Search size={18} /> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="mx-auto mb-3 stat-icon bg-warning bg-opacity-10 text-warning">
                  <Award size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-1">5-Star Luxury Rating</h6>
                <p className="text-muted small mb-0">Award-winning oceanfront suites & services</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="mx-auto mb-3 stat-icon bg-primary bg-opacity-10 text-primary">
                  <ShieldCheck size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Secure Instant Booking</h6>
                <p className="text-muted small mb-0">Encrypted payments & instant invoice generation</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="mx-auto mb-3 stat-icon bg-success bg-opacity-10 text-success">
                  <Waves size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Heated Infinity Pools</h6>
                <p className="text-muted small mb-0">Private terrace jacuzzis & wellness cabanas</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="mx-auto mb-3 stat-icon bg-info bg-opacity-10 text-info">
                  <Coffee size={28} />
                </div>
                <h6 className="fw-bold text-dark mb-1">24/7 Butler & Dining</h6>
                <p className="text-muted small mb-0">Gourmet room service directly via our app</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites & Rooms */}
      <section className="py-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
                Handpicked Collections
              </span>
              <h2 className="display-6 fw-bold text-dark mt-1 mb-0">Featured Signature Suites</h2>
            </div>
            <Link to="/rooms" className="btn btn-outline-dark mt-3 mt-md-0 d-inline-flex align-items-center gap-1">
              Browse All Rooms <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Role-Based Operations Teaser */}
      <section className="py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark text-uppercase px-3 py-1 fw-bold mb-3">
                End-To-End Hospitality Engine
              </span>
              <h2 className="display-6 fw-bold text-white mb-3">
                Engineered for Guests, Staff & Hotel Administrators
              </h2>
              <p className="text-white-50 mb-4">
                HotelPro simplifies hotel operations at every touchpoint. From self-service guest reservations and instant digital invoices to front-desk check-in tracking and executive analytics.
              </p>

              <div className="vstack gap-3">
                <div className="d-flex gap-3">
                  <div className="p-2 rounded bg-warning bg-opacity-20 text-warning h-100">
                    <Users size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Guest Experience Portal</h6>
                    <p className="text-white-50 small mb-0">Browse rooms with live availability, make card payments, order room service, and request hassle-free cancellations.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="p-2 rounded bg-info bg-opacity-20 text-info h-100">
                    <Compass size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Front Desk & Housekeeping Operations</h6>
                    <p className="text-white-50 small mb-0">Streamline check-ins, record departures, and dispatch housekeeping turnover with 1-click room status updates.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="p-2 rounded bg-success bg-opacity-20 text-success h-100">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Executive Analytics & Governance</h6>
                    <p className="text-white-50 small mb-0">Monitor real-time occupancy rates, monthly revenue trends, seasonal pricing multipliers, and full audit logs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card-custom bg-secondary bg-opacity-50 p-4 border border-secondary border-opacity-50 rounded-4 shadow-lg text-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Live Operational Snapshot</h5>
                  <span className="badge bg-success">System Active</span>
                </div>
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <div className="p-3 bg-dark rounded-3 border border-secondary">
                      <div className="fs-3 fw-bold text-warning">94.2%</div>
                      <small className="text-white-50">Guest Satisfaction</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-dark rounded-3 border border-secondary">
                      <div className="fs-3 fw-bold text-info">24/7</div>
                      <small className="text-white-50">Concierge Desk</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-dark rounded-3 border border-secondary">
                      <div className="fs-3 fw-bold text-success">100%</div>
                      <small className="text-white-50">Instant Confirmation</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-dark rounded-3 border border-secondary">
                      <div className="fs-3 fw-bold text-primary">Zero</div>
                      <small className="text-white-50">Booking Friction</small>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-top border-secondary text-center">
                  <Link to="/rooms" className="btn btn-luxury w-100 justify-content-center">
                    Explore Suites & Reserve Online
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Testimonials Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
              Guest Stories
            </span>
            <h2 className="display-6 fw-bold text-dark mt-1">Loved by World Travelers</h2>
            <p className="text-muted">Read genuine feedback from guests who made HotelPro their home away from home.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 card-custom">
                <div className="d-flex text-warning mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-muted small mb-4 italic">
                  "The Presidential Suite was utterly majestic. The sunset view from the private jacuzzi while enjoying chilled champagne is a memory we will cherish forever. Seamless check-in through the app!"
                </p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Eleanor Vance"
                    className="rounded-circle"
                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Eleanor Vance</h6>
                    <small className="text-muted">Presidential Suite Guest</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 card-custom">
                <div className="d-flex text-warning mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-muted small mb-4 italic">
                  "As a frequent business traveler, I appreciate efficiency. HotelPro’s Executive Ocean View suite was quiet, pristine, with blazing-fast Wi-Fi, and the digital invoice arrived instantly in my inbox."
                </p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="David Sterling"
                    className="rounded-circle"
                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">David Sterling</h6>
                    <small className="text-muted">Executive Traveler</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 card-custom">
                <div className="d-flex text-warning mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-muted small mb-4 italic">
                  "Our stay in the Family Garden Villa was wonderful. The staff responded to our extra towel request within 10 minutes. The automated room service ordering on the site is brilliant!"
                </p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                    alt="Sophia Martinez"
                    className="rounded-circle"
                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Sophia Martinez</h6>
                    <small className="text-muted">Family Villa Guest</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
