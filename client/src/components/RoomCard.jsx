import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Eye, Sparkles } from 'lucide-react';

const RoomCard = ({ room }) => {
  const currentPrice = Math.round(room.pricePerNight * (room.seasonalPriceMultiplier || 1));
  const categoryName = room.category?.name || 'Standard Suite';
  const coverImage = room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-status-available">Available</span>;
      case 'Occupied':
        return <span className="badge badge-status-occupied">Occupied</span>;
      case 'Cleaning':
        return <span className="badge badge-status-cleaning">Cleaning</span>;
      case 'Maintenance':
        return <span className="badge badge-status-maintenance">Maintenance</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="card h-100 card-custom card-hover overflow-hidden border-0">
      <div className="position-relative">
        <img
          src={coverImage}
          alt={categoryName}
          className="card-img-top"
          style={{ height: '240px', objectFit: 'cover' }}
        />
        <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
          {room.isFeatured && (
            <span className="badge bg-warning text-dark d-flex align-items-center gap-1 shadow-sm">
              <Sparkles size={12} /> Featured
            </span>
          )}
          {getStatusBadge(room.status)}
        </div>
        <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
          <span className="badge bg-dark bg-opacity-75">Room #{room.roomNumber}</span>
          <span className="small">Floor {room.floor}</span>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span className="text-warning text-uppercase fw-bold small" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {categoryName}
            </span>
            <h5 className="card-title fw-bold text-dark mt-1 mb-0">
              {room.roomNumber} - {categoryName}
            </h5>
          </div>
          <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded text-dark fw-bold small">
            <Star size={14} className="text-warning fill-warning" />
            <span>{room.rating || 4.8}</span>
            <span className="text-muted fw-normal" style={{ fontSize: '0.7rem' }}>({room.numReviews || 0})</span>
          </div>
        </div>

        <p className="card-text text-muted small line-clamp-2 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {room.description || room.category?.description || 'Luxurious accommodations tailored with premier amenities for an unforgettable stay.'}
        </p>

        {/* Capacity & Specs */}
        <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
          <div className="d-flex align-items-center gap-1">
            <Users size={16} className="text-primary" />
            <span>Up to {room.category?.capacity?.adults || 2} Adults</span>
          </div>
          <span>•</span>
          <div>
            <span>{room.category?.bedType || 'King Bed'}</span>
          </div>
        </div>

        {/* Amenities preview */}
        <div className="d-flex flex-wrap gap-1 mb-4">
          {(room.amenities || ['Wi-Fi', 'Smart TV', 'Air Conditioning']).slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-pill">
              {amenity}
            </span>
          ))}
          {(room.amenities?.length || 0) > 3 && (
            <span className="amenity-pill text-primary">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted small d-block">Starting from</span>
            <div>
              <span className="fs-4 fw-bold text-dark">${currentPrice}</span>
              <span className="text-muted small"> / night</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/rooms/${room._id}`} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
              <Eye size={14} /> Details
            </Link>
            {room.status === 'Available' ? (
              <Link to={`/booking/${room._id}`} className="btn btn-sm btn-luxury">
                Book Now
              </Link>
            ) : (
              <button disabled className="btn btn-sm btn-secondary opacity-75">
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
