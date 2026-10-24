const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: true,
    },
    floor: {
      type: Number,
      required: true,
      default: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    seasonalPriceMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 3.0,
    },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'Occupied', 'Maintenance', 'Cleaning'],
      default: 'Available',
    },
    housekeepingStatus: {
      type: String,
      enum: ['Clean', 'Dirty', 'In-Progress', 'Inspected'],
      default: 'Clean',
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
