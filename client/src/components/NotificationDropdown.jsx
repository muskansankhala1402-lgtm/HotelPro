import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="dropdown position-relative">
      <button
        className="btn btn-link text-white position-relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{ border: 'none', background: 'transparent' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow-lg p-0"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            borderRadius: '12px',
            zIndex: 1050,
          }}
        >
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-decoration-none p-0 text-primary"
                onClick={markAllRead}
                style={{ fontSize: '0.8rem' }}
              >
                <CheckCheck size={14} className="me-1" /> Mark all read
              </button>
            )}
          </div>

          <div className="p-1">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <Info size={24} className="d-block mx-auto mb-2 opacity-50" />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    markSingleRead(n._id);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded mb-1 cursor-pointer transition ${
                    n.isRead ? 'opacity-75' : 'bg-light border-start border-3 border-warning fw-semibold'
                  }`}
                  style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark">{n.title}</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-muted mb-0 small">{n.message}</p>
                  {n.link && (
                    <Link to={n.link} className="small text-primary text-decoration-underline mt-1 d-inline-block">
                      View details
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
