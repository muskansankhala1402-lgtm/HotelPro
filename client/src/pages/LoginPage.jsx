import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ShieldCheck, Compass, Users, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else if (redirectPath && redirectPath !== '/') navigate(redirectPath);
      else navigate('/guest/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/guest/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card-custom p-4 p-md-5 bg-white border-0 shadow-lg">
          {/* Logo Brand Header */}
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-2"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Building2 size={26} />
            </div>
            <h3 className="fw-bold text-dark mb-1">Welcome to HotelPro</h3>
            <p className="text-muted small">Sign in to manage your luxury stay or hotel operations</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          {/* Quick Demo Login Pills */}
          <div className="mb-4 p-3 bg-light rounded-3 text-center border">
            <span className="small fw-bold text-dark d-flex align-items-center justify-content-center gap-1 mb-2">
              <Sparkles size={14} className="text-warning" /> 1-Click Persona Login:
            </span>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={() => handleDemoFill('admin')}
              >
                <ShieldCheck size={12} /> Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 text-dark"
                onClick={() => handleDemoFill('staff')}
              >
                <Compass size={12} /> Staff
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 text-dark"
                onClick={() => handleDemoFill('guest')}
              >
                <Users size={12} /> Guest
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy w-100 justify-content-center py-2 mb-3 shadow"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-muted small mt-3">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-primary fw-bold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
