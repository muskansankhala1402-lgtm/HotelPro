const mongoose = require('mongoose');

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 1, min: 0 },
    },
    bedType: {
      type: String,
      enum: ['Single', 'Double', 'Queen', 'King', 'Twin Beds'],
      default: 'King',
    },
    amenities: [
      {
        type: String,
      },
    ],
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    },
    sizeSqFt: {
      type: Number,
      default: 350,
    },
  },
  {
    timestamps: true,
  }
);

roomCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('RoomCategory', roomCategorySchema);
