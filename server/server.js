const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const seedDatabase = require('./seed/seeder');

// Route files
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const staffRoutes = require('./routes/staffRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'HotelPro Hospitality Management Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HotelPro API (Roomly Hotel Management System)',
    documentation: '/api/health',
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Check if auto-seed is needed
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log('[Startup] No existing users found. Auto-seeding initial database with sample rooms, guests, staff, and admin...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 HotelPro Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✨ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection]:', err.message);
    });
  } catch (err) {
    console.error('[Server Start Error]:', err);
    process.exit(1);
  }
};

startServer();
