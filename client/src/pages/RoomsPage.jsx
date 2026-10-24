import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import { Search, Filter, RotateCcw, Calendar, DollarSign, SlidersHorizontal, AlertCircle } from 'lucide-react';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '1200');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [sortBy, setSortBy] = useState('pricePerNight');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, maxPrice, statusFilter, checkIn, checkOut, sortBy, order]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/rooms/categories/all');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append('search', searchKeyword);
      if (selectedCategory) params.append('category', selectedCategory);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (statusFilter) params.append('status', statusFilter);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/rooms?${params.toString()}`);
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setMaxPrice('1200');
    setStatusFilter('');
    setCheckIn('');
    setCheckOut('');
    setSortBy('pricePerNight');
    setOrder('asc');
    setSearchParams({});
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header Banner */}
        <div className="mb-4">
          <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
            Accommodations
          </span>
          <h1 className="display-5 fw-bold text-dark mt-1">Rooms & Luxury Suites</h1>
          <p className="text-muted">
            Explore our curated selection of rooms, suites, and private villas. Enjoy real-time availability and best rates guaranteed.
          </p>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="card-custom p-4 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} className="text-warning" /> Filters
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-muted p-0 d-flex align-items-center gap-1"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              {/* Keyword Search */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by room # or amenity..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <button className="btn btn-sm btn-dark" type="submit">
                    <Search size={14} />
                  </button>
                </div>
              </form>

              {/* Category Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Room Category</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-dark mb-0">Max Rate / Night</label>
                  <span className="badge bg-dark">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="150"
                  max="1200"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <div className="d-flex justify-content-between text-muted small">
                  <span>$150</span>
                  <span>$1,200</span>
                </div>
              </div>

              {/* Dates Availability Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                  <Calendar size={14} className="text-primary" /> Check-in
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                  <Calendar size={14} className="text-primary" /> Check-out
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Availability Status</label>
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Rooms</option>
                  <option value="Available">Available Only</option>
                  <option value="Occupied">Currently Occupied</option>
                  <option value="Cleaning">In Housekeeping</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-luxury w-100 justify-content-center btn-sm mt-2"
                onClick={fetchRooms}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="col-lg-9">
            {/* Top Bar Sort & Count */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center bg-white p-3 rounded-3 border mb-4">
              <span className="text-muted small mb-2 mb-sm-0">
                Showing <strong className="text-dark">{rooms.length}</strong> luxurious accommodations
              </span>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Sort by:</span>
                <select
                  className="form-select form-select-sm w-auto"
                  value={`${sortBy}-${order}`}
                  onChange={(e) => {
                    const [sb, ord] = e.target.value.split('-');
                    setSortBy(sb);
                    setOrder(ord);
                  }}
                >
                  <option value="pricePerNight-asc">Price: Low to High</option>
                  <option value="pricePerNight-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="roomNumber-asc">Room Number</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2 small">Scanning hotel rooms & suites...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-5 card-custom p-5">
                <AlertCircle size={48} className="text-warning mx-auto mb-3" />
                <h4 className="fw-bold text-dark">No Rooms Found</h4>
                <p className="text-muted mb-4">
                  No accommodations match your active filter criteria. Try adjusting your dates or price range.
                </p>
                <button className="btn btn-navy" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {rooms.map((room) => (
                  <div key={room._id} className="col-md-6">
                    <RoomCard room={room} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
