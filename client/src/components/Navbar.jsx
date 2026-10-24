import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  ShieldCheck,
  Building2,
  CalendarCheck,
  LogOut,
  User,
  Key,
  Compass,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickDemo = async (targetRole) => {
    try {
      await demoLogin(targetRole);
      setShowDemoModal(false);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'staff') navigate('/staff');
      else navigate('/guest/bookings');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Building2 size={24} />
            </div>
            <div>
              <span className="fw-bold tracking-tight text-white fs-4">HotelPro</span>
              <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                Roomly Suite
              </span>
            </div>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#hotelNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="hotelNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
              <li className="nav-item">
                <Link className="nav-link text-white-50 hover-white" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white-50 hover-white" to="/rooms">
                  Rooms & Suites
                </Link>
              </li>

              {/* Role specific links */}
              {isAuthenticated && role === 'guest' && (
                <li className="nav-item">
                  <Link className="nav-link text-warning fw-semibold" to="/guest/bookings">
                    <CalendarCheck size={16} className="me-1" /> My Reservations
                  </Link>
                </li>
              )}

              {isAuthenticated && (role === 'staff' || role === 'admin') && (
                <li className="nav-item">
                  <Link className="nav-link text-info fw-semibold" to="/staff">
                    <Compass size={16} className="me-1" /> Staff Operations
                  </Link>
                </li>
              )}

              {isAuthenticated && role === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link text-warning fw-semibold" to="/admin">
                    <ShieldCheck size={16} className="me-1" /> Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center gap-3">
              {/* Demo Account Switcher Button */}
              <button
                type="button"
                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                onClick={() => setShowDemoModal(true)}
              >
                <Sparkles size={14} />
                <span>Demo Switcher</span>
              </button>

              {/* Notification Bell */}
              <NotificationDropdown />

              {isAuthenticated ? (
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-dark dropdown-toggle d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border border-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="rounded-circle"
                      style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                    />
                    <span className="text-white small fw-medium text-truncate" style={{ maxWidth: '120px' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.6rem' }}>
                      {role}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <h6 className="dropdown-header">{user?.email}</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                        <User size={16} /> Profile & Settings
                      </Link>
                    </li>
                    {role === 'guest' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/guest/bookings">
                          <CalendarCheck size={16} /> My Bookings
                        </Link>
                      </li>
                    )}
                    {role === 'staff' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/staff">
                          <Compass size={16} /> Staff Desk
                        </Link>
                      </li>
                    )}
                    {role === 'admin' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/admin">
                          <ShieldCheck size={16} /> Admin Console
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-sm btn-outline-light">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-luxury">
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Switcher Modal */}
      {showDemoModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Key size={18} className="text-warning" /> Quick Demo Role Switcher
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDemoModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  Instantly switch between any of HotelPro’s 3 core persona roles to evaluate features without manually typing passwords:
                </p>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-primary text-start p-3 d-flex align-items-center gap-3 border-2"
                    onClick={() => handleQuickDemo('admin')}
                  >
                    <div className="p-2 bg-primary text-white rounded">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="fw-bold">Administrator (Alexander Wright)</div>
                      <small className="text-muted">Analytics, Revenue, Room Inventory, Users, Security Audits</small>
                    </div>
                  </button>

                  <button
                    className="btn btn-outline-info text-start p-3 d-flex align-items-center gap-3 border-2"
                    onClick={() => handleQuickDemo('staff')}
                  >
                    <div className="p-2 bg-info text-white rounded">
                      <Compass size={24} />
                    </div>
                    <div>
                      <div className="fw-bold">Hotel Staff / Front Desk (Sarah Jenkins)</div>
                      <small className="text-muted">Check-In, Check-Out, Housekeeping, Guest Service Tasks</small>
                    </div>
                  </button>

                  <button
                    className="btn btn-outline-warning text-start p-3 d-flex align-items-center gap-3 border-2"
                    onClick={() => handleQuickDemo('guest')}
                  >
                    <div className="p-2 bg-warning text-dark rounded">
                      <CalendarCheck size={24} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Guest (Eleanor Vance)</div>
                      <small className="text-muted">Room Booking, Invoices, Service Requests, Reviews & Ratings</small>
                    </div>
                  </button>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDemoModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
