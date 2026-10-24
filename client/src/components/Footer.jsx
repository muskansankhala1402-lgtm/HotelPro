import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Building2 size={20} />
              </div>
              <span className="fw-bold fs-4 text-white">HotelPro</span>
              <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                Roomly
              </span>
            </div>
            <p className="text-secondary small pe-lg-4">
              Your ultimate hotel management and luxury booking solution. Streamlined operations, real-time availability tracking, role-based security, and seamless guest experiences.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small mt-2">
              <ShieldCheck size={16} className="text-warning" />
              <span>Enterprise Grade 256-bit Encryption & JWT Security</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              Navigation
            </h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-secondary hover-white">Home</Link></li>
              <li className="mb-2"><Link to="/rooms" className="text-decoration-none text-secondary hover-white">Rooms & Suites</Link></li>
              <li className="mb-2"><Link to="/rooms?category=deluxe" className="text-decoration-none text-secondary hover-white">Deluxe Rooms</Link></li>
              <li className="mb-2"><Link to="/rooms?category=presidential" className="text-decoration-none text-secondary hover-white">Presidential Suites</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              Hotel Operations
            </h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/guest/bookings" className="text-decoration-none text-secondary hover-white">Guest Reservations</Link></li>
              <li className="mb-2"><Link to="/staff" className="text-decoration-none text-secondary hover-white">Front Desk Check-in</Link></li>
              <li className="mb-2"><Link to="/staff" className="text-decoration-none text-secondary hover-white">Housekeeping Tracker</Link></li>
              <li className="mb-2"><Link to="/admin" className="text-decoration-none text-secondary hover-white">Executive Analytics</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              Concierge & Contact
            </h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2 d-flex align-items-start gap-2">
                <MapPin size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>777 Ocean Grand Boulevard, Santa Monica, CA 90401</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <Phone size={16} className="text-warning flex-shrink-0" />
                <span>+1 (800) 555-ROOMLY</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <Mail size={16} className="text-warning flex-shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <p className="mb-2 mb-md-0">
            © {new Date().getFullYear()} HotelPro Hospitality Solutions. All rights reserved. Built with MERN Stack.
          </p>
          <div className="d-flex align-items-center gap-1">
            <span>Designed for modern hospitality excellence</span>
            <Heart size={14} className="text-danger ms-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
