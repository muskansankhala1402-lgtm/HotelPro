const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const RoomCategory = require('../models/RoomCategory');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      RoomCategory.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      ServiceRequest.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seeder] Creating Initial Users...');
    // Note: User model pre-save hook will hash passwords
    const adminUser = await User.create({
      name: 'Alexander Wright (Admin)',
      email: 'admin@hotelpro.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      department: 'Management',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      address: {
        street: '100 Executive Way',
        city: 'Beverly Hills',
        state: 'CA',
        country: 'USA',
        zipCode: '90210',
      },
    });

    const staffFrontDesk = await User.create({
      name: 'Sarah Jenkins (Front Desk)',
      email: 'staff@hotelpro.com',
      password: 'password123',
      role: 'staff',
      phone: '+1 (555) 018-9922',
      department: 'Front Desk',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      address: {
        street: '45 Palm Grove St',
        city: 'Santa Monica',
        state: 'CA',
        country: 'USA',
        zipCode: '90401',
      },
    });

    const staffHousekeeping = await User.create({
      name: 'Marco Rossi (Housekeeping Lead)',
      email: 'housekeeping@hotelpro.com',
      password: 'password123',
      role: 'staff',
      phone: '+1 (555) 017-3311',
      department: 'Housekeeping',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      address: {
        street: '12 Harbor Blvd',
        city: 'Long Beach',
        state: 'CA',
        country: 'USA',
        zipCode: '90802',
      },
    });

    const guest1 = await User.create({
      name: 'Eleanor Vance',
      email: 'guest@hotelpro.com',
      password: 'password123',
      role: 'guest',
      phone: '+1 (555) 014-7744',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      address: {
        street: '88 Horizon Way',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        zipCode: '98101',
      },
    });

    const guest2 = await User.create({
      name: 'David Sterling',
      email: 'david.sterling@example.com',
      password: 'password123',
      role: 'guest',
      phone: '+1 (555) 012-3456',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      address: {
        street: '420 Madison Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10017',
      },
    });

    console.log('[Seeder] Creating Room Categories...');
    const categoriesData = [
      {
        name: 'Presidential Suite',
        description: 'The pinnacle of luxury with panoramic ocean views, private terrace jacuzzi, master bedroom, and 24/7 personal butler service.',
        basePrice: 850,
        capacity: { adults: 4, children: 2 },
        bedType: 'King',
        amenities: ['Private Jacuzzi', 'Butler Service', 'Ocean View Terrace', 'Espresso Machine', 'High-speed Wi-Fi', 'Complimentary Champagne', 'Smart TV 75"', 'Marble Bathroom'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        sizeSqFt: 1250,
      },
      {
        name: 'Executive Ocean View',
        description: 'Spacious corner suite designed for discerning travelers, featuring floor-to-ceiling vistas, premium workstation, and rainfall walk-in shower.',
        basePrice: 480,
        capacity: { adults: 2, children: 1 },
        bedType: 'King',
        amenities: ['Ocean View', 'Balcony', 'Executive Workstation', 'Mini Bar', 'High-speed Wi-Fi', 'Room Service', 'Luxury Bathrobe', 'Nespresso'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        sizeSqFt: 680,
      },
      {
        name: 'Deluxe King Room',
        description: 'Modern sophisticated retreat with plush king-sized bedding, ambient mood lighting, and sleek modern aesthetic.',
        basePrice: 320,
        capacity: { adults: 2, children: 1 },
        bedType: 'King',
        amenities: ['King Bed', 'City Skyline View', 'Smart TV 55"', 'Walk-in Shower', 'High-speed Wi-Fi', 'Climate Control', 'Safety Deposit Box'],
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        sizeSqFt: 460,
      },
      {
        name: 'Classic Queen Suite',
        description: 'Charming and peaceful room offering sublime comfort, ergonomic workspace, and curated boutique furnishings.',
        basePrice: 220,
        capacity: { adults: 2, children: 0 },
        bedType: 'Queen',
        amenities: ['Queen Bed', 'Courtyard View', 'Smart TV', 'En-suite Bathroom', 'High-speed Wi-Fi', 'Coffee Maker', 'Desk'],
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
        sizeSqFt: 380,
      },
      {
        name: 'Family Garden Villa',
        description: 'Expansive family residence nestled next to the botanical gardens with dual connecting bedrooms and kitchen lounge.',
        basePrice: 620,
        capacity: { adults: 4, children: 3 },
        bedType: 'Twin Beds',
        amenities: ['Garden Patio', 'Dual Bedrooms', 'Kitchenette', 'Dining Area', 'High-speed Wi-Fi', 'Kids Welcome Kit', 'Private Lawn'],
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        sizeSqFt: 980,
      },
    ];

    const categories = await RoomCategory.create(categoriesData);

    console.log('[Seeder] Creating Rooms...');
    const roomsData = [
      {
        roomNumber: 'PH-1001',
        category: categories[0]._id, // Presidential
        floor: 10,
        pricePerNight: 850,
        status: 'Available',
        housekeepingStatus: 'Clean',
        isFeatured: true,
        rating: 4.9,
        numReviews: 18,
        description: 'Exclusive 10th floor penthouse suite with 180° sunset ocean views and private wraparound deck.',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[0].amenities,
      },
      {
        roomNumber: 'PH-1002',
        category: categories[0]._id, // Presidential
        floor: 10,
        pricePerNight: 890,
        status: 'Available',
        housekeepingStatus: 'Inspected',
        isFeatured: true,
        rating: 5.0,
        numReviews: 12,
        description: 'Presidential suite with grand piano, dining salon, and oceanfront heated infinity spa.',
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[0].amenities,
      },
      {
        roomNumber: 'EX-501',
        category: categories[1]._id, // Executive Ocean View
        floor: 5,
        pricePerNight: 480,
        status: 'Occupied',
        housekeepingStatus: 'Clean',
        isFeatured: true,
        rating: 4.8,
        numReviews: 34,
        description: 'Sunlit oceanfront corner suite with wrap-around glass windows and private breakfast terrace.',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[1].amenities,
      },
      {
        roomNumber: 'EX-502',
        category: categories[1]._id, // Executive Ocean View
        floor: 5,
        pricePerNight: 480,
        status: 'Available',
        housekeepingStatus: 'Clean',
        isFeatured: false,
        rating: 4.7,
        numReviews: 29,
        description: 'Fifth floor panoramic sea suite with dedicated workspace and automated shade controls.',
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[1].amenities,
      },
      {
        roomNumber: 'DLX-301',
        category: categories[2]._id, // Deluxe King
        floor: 3,
        pricePerNight: 320,
        status: 'Available',
        housekeepingStatus: 'Clean',
        isFeatured: true,
        rating: 4.7,
        numReviews: 45,
        description: 'Spacious Deluxe King with custom plush Italian linen bedding and downtown architectural view.',
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[2].amenities,
      },
      {
        roomNumber: 'DLX-302',
        category: categories[2]._id, // Deluxe King
        floor: 3,
        pricePerNight: 320,
        status: 'Cleaning',
        housekeepingStatus: 'Dirty',
        isFeatured: false,
        rating: 4.6,
        numReviews: 21,
        description: 'Third floor deluxe room with acoustic soundproofing and deep soaking tub.',
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[2].amenities,
      },
      {
        roomNumber: 'CLS-201',
        category: categories[3]._id, // Classic Queen
        floor: 2,
        pricePerNight: 220,
        status: 'Available',
        housekeepingStatus: 'Clean',
        isFeatured: false,
        rating: 4.5,
        numReviews: 52,
        description: 'Cozy queen suite overlooking tranquil landscaped courtyard fountains.',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[3].amenities,
      },
      {
        roomNumber: 'CLS-202',
        category: categories[3]._id, // Classic Queen
        floor: 2,
        pricePerNight: 220,
        status: 'Maintenance',
        housekeepingStatus: 'In-Progress',
        isFeatured: false,
        rating: 4.4,
        numReviews: 19,
        description: 'Classic queen room currently undergoing scheduled HVAC filter upgrades.',
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[3].amenities,
      },
      {
        roomNumber: 'VIL-101',
        category: categories[4]._id, // Family Garden Villa
        floor: 1,
        pricePerNight: 620,
        status: 'Available',
        housekeepingStatus: 'Clean',
        isFeatured: true,
        rating: 4.9,
        numReviews: 28,
        description: 'Secluded garden villa with private lawn, outdoor barbecue patio, and 2 en-suite bedrooms.',
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        ],
        amenities: categories[4].amenities,
      },
    ];

    const rooms = await Room.create(roomsData);

    console.log('[Seeder] Creating Sample Bookings & Payments...');
    const now = new Date();
    const futureCheckIn = new Date(now);
    futureCheckIn.setDate(futureCheckIn.getDate() + 5);
    const futureCheckOut = new Date(futureCheckIn);
    futureCheckOut.setDate(futureCheckOut.getDate() + 3);

    const booking1 = await Booking.create({
      bookingReference: 'HP-109284',
      guest: guest1._id,
      room: rooms[0]._id, // PH-1001
      checkInDate: futureCheckIn,
      checkOutDate: futureCheckOut,
      totalNights: 3,
      guestsCount: { adults: 2, children: 1 },
      pricePerNight: 850,
      subtotal: 2550,
      taxes: 306,
      serviceFee: 25,
      totalAmount: 2881,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      paymentId: 'TX-998822-1001',
      specialRequests: 'High floor preferred, bottle of sparkling water on arrival.',
      invoiceNumber: 'INV-401920',
    });

    await Payment.create({
      booking: booking1._id,
      user: guest1._id,
      transactionId: 'TX-998822-1001',
      amount: 2881,
      paymentMethod: 'Credit Card',
      cardLast4: '4242',
      status: 'Success',
      invoiceNumber: 'INV-401920',
      notes: 'Confirmed payment for Presidential Suite HP-109284',
    });

    // Active Checked-In booking for EX-501
    const pastCheckIn = new Date(now);
    pastCheckIn.setDate(pastCheckIn.getDate() - 1);
    const pastCheckOut = new Date(now);
    pastCheckOut.setDate(pastCheckOut.getDate() + 2);

    const booking2 = await Booking.create({
      bookingReference: 'HP-772183',
      guest: guest2._id,
      room: rooms[2]._id, // EX-501
      checkInDate: pastCheckIn,
      checkOutDate: pastCheckOut,
      totalNights: 3,
      guestsCount: { adults: 2, children: 0 },
      pricePerNight: 480,
      subtotal: 1440,
      taxes: 172.8,
      serviceFee: 25,
      totalAmount: 1637.8,
      status: 'Checked-In',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      paymentId: 'TX-883391-501',
      specialRequests: 'Late check-out request if possible.',
      checkedInAt: pastCheckIn,
      checkedInBy: staffFrontDesk._id,
      invoiceNumber: 'INV-401921',
    });

    await Payment.create({
      booking: booking2._id,
      user: guest2._id,
      transactionId: 'TX-883391-501',
      amount: 1637.8,
      paymentMethod: 'Credit Card',
      cardLast4: '5566',
      status: 'Success',
      invoiceNumber: 'INV-401921',
      notes: 'Paid booking HP-772183',
    });

    console.log('[Seeder] Creating Service Requests...');
    await ServiceRequest.create([
      {
        guest: guest2._id,
        room: rooms[2]._id,
        booking: booking2._id,
        serviceType: 'Extra Towels & Linens',
        description: 'Please bring 2 additional plush bath towels and extra pillows.',
        priority: 'Medium',
        status: 'In-Progress',
        assignedStaff: staffHousekeeping._id,
      },
      {
        guest: guest2._id,
        room: rooms[2]._id,
        booking: booking2._id,
        serviceType: 'Food & Beverage',
        description: 'Room service: 2 club sandwiches and iced sparkling tea.',
        priority: 'High',
        status: 'Pending',
      },
    ]);

    console.log('[Seeder] Creating Reviews...');
    await Review.create([
      {
        room: rooms[0]._id,
        user: guest1._id,
        booking: booking1._id,
        rating: 5,
        cleanlinessRating: 5,
        comfortRating: 5,
        serviceRating: 5,
        comment: 'An extraordinary experience! The Presidential Suite exceeded every expectation. The ocean views from the terrace jacuzzi at sunset were breathtaking. The staff was incredibly welcoming.',
        isApproved: true,
        staffReply: {
          message: 'Thank you Eleanor! It was an absolute delight hosting you at HotelPro. We look forward to welcoming you back.',
          repliedAt: new Date(),
          repliedBy: adminUser._id,
        },
      },
      {
        room: rooms[2]._id,
        user: guest2._id,
        booking: booking2._id,
        rating: 5,
        cleanlinessRating: 5,
        comfortRating: 5,
        serviceRating: 4,
        comment: 'Superb executive corner suite. The bed is exceptionally comfortable and the workspace had blazing fast Wi-Fi for my remote work meetings.',
        isApproved: true,
      },
    ]);

    console.log('[Seeder] Creating Notifications & Activity Logs...');
    await Notification.create([
      {
        recipient: guest1._id,
        title: 'Booking Confirmed!',
        message: 'Your reservation HP-109284 for Room PH-1001 is confirmed.',
        type: 'booking',
        link: '/guest/bookings',
      },
      {
        recipient: guest2._id,
        title: 'Welcome to HotelPro!',
        message: 'You have been checked in to Room EX-501. Dial 0 for front desk or use the app for requests.',
        type: 'booking',
        link: '/guest/services',
      },
    ]);

    await ActivityLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'SYSTEM_SEED',
        category: 'System',
        details: 'HotelPro enterprise database initial seed completed successfully.',
      },
      {
        user: staffFrontDesk._id,
        userName: staffFrontDesk.name,
        userRole: staffFrontDesk.role,
        action: 'GUEST_CHECKIN',
        category: 'Staff',
        details: 'Checked in David Sterling to Room #EX-501',
      },
    ]);

    console.log('✅ [Seeder] Database seeded successfully with demo users, rooms, bookings, and logs!');
  } catch (err) {
    console.error('❌ [Seeder] Error seeding database:', err);
    throw err;
  }
};

// If run directly via `node seed/seeder.js`
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = seedDatabase;
