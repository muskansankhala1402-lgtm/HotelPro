import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, CheckCircle, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [country, setCountry] = useState(user?.address?.country || 'USA');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg('');

    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        avatar,
        address: { street, city, state, country, zipCode },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg('Profile information updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match');
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdErr(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '850px' }}>
        <div className="card-custom p-4 mb-4 bg-white border-0 shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={name}
              className="rounded-circle shadow-sm"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <span className="badge bg-dark text-uppercase small mb-1">{user?.role}</span>
              <h3 className="fw-bold mb-0 text-dark">{user?.name}</h3>
              <small className="text-muted">{user?.email} • Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</small>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card-custom p-4 bg-white border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-3">Edit Profile Details</h5>
              {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}

              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-bold text-dark">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-bold text-dark">Avatar URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-sm-4">
                    <label className="form-label small fw-bold text-dark">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label small fw-bold text-dark">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label small fw-bold text-dark">Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-navy w-100 justify-content-center btn-sm">
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card-custom p-4 bg-white border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-3">Security & Password</h5>
              {pwdMsg && <div className="alert alert-success py-2 small">{pwdMsg}</div>}
              {pwdErr && <div className="alert alert-danger py-2 small">{pwdErr}</div>}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-outline-dark w-100 justify-content-center btn-sm">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
