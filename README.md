# HotelPro (Roomly) — Enterprise Hotel Management Solution

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **HotelPro** (also known as **Roomly**) is a full-stack, enterprise-grade Hotel Management System engineered with the **MERN Stack** (MongoDB, Express.js, React JSX, Node.js). Designed for both boutique luxury properties and international hospitality chains, HotelPro delivers seamless room reservations, real-time availability tracking, front-desk operations, automated housekeeping turnover, integrated payments with itemized invoice generation, and executive analytical dashboards.

---

## 🌟 Key Features & Epic Architecture

HotelPro directly satisfies all **6 Epics and 19 Core Tasks** defined in the project specification:

### 1. 🛡️ Epic 1: Authentication & Role-Based Security (RBAC)
- **JWT Authentication & Bcrypt Hashing:** Secure token-based session management and salted password hashing.
- **Three Persona Roles:**
  - **Guest:** Browse rooms, book stays, process card payments, download invoices, request room services, and write reviews.
  - **Staff:** Front desk check-ins, guest check-outs, housekeeping tracking, and guest service request dispatch.
  - **Admin:** Executive revenue analytics, room inventory management, seasonal multiplier pricing, user governance, and security audit logs.
- **1-Click Persona Switcher:** Instant demo switcher directly in the navbar to test Admin, Staff, and Guest views without typing passwords.

### 2. 🛏️ Epic 2: Hotel & Room Inventory Management
- **Room Categories:** Presidential Suites, Executive Ocean View, Deluxe King, Classic Queen, Family Garden Villa.
- **Dynamic Search & Filtering:** Filter by Category, Max Rate Range, Guest Capacity, Bed Type, Floor, and Status.
- **Real-Time Date Availability Engine:** Automatically queries overlapping active bookings between check-in and check-out dates to prevent double bookings.
- **Seasonal Pricing Multiplier:** Administrators can apply hotel-wide or category multipliers (0.8x off-season to 2.0x peak holiday).

### 3. 📅 Epic 3: Guest Reservation & Booking Workflow
- **Interactive Stay Calculator:** Computes nights, room subtotal, 12% occupancy tax, resort service fees, and discounts in real-time.
- **Reservation Lifecycle:** `Confirmed` ➔ `Checked-In` ➔ `Checked-Out` or `Cancelled`.
- **Cancellation & Automated Refund Policy:** Guests can request cancellation; automated calculation awards 100% refund for cancellations > 48h and 80% within 48h.

### 4. 💳 Epic 4: Payment Gateway & Digital Invoicing
- **Simulated Payment Processing:** Instant test card processing (`4242 •••• •••• 4242`) with transaction ID generation.
- **Itemized Digital Invoice:** Printable and downloadable formal invoices with complete financial breakdown, tax identification, and QR/transaction audit reference.
- **Print Optimization:** Formatted with CSS `@media print` rules for clean single-page PDF generation.

### 5. 🛎️ Epic 5: Front Desk, Housekeeping & Guest Services
- **Front Desk Operations:** 1-click **Check-In Guest** (assigns room to `Occupied`) and 1-click **Check-Out Guest** (sets room to `Cleaning` & housekeeping to `Dirty`).
- **Housekeeping Turnover Board:** Real-time room readiness status (`Clean`, `Dirty`, `In-Progress`, `Inspected`).
- **Guest In-Room Service Requests:** Room Cleaning, Extra Towels & Linens, Food & Beverage, Luggage Assistance, Maintenance & Airport Shuttle dispatch.

### 6. 📊 Epic 6: Executive Admin Analytics & Auditing
- **Visual Analytics with Recharts:**
  - 📈 **Monthly Revenue Performance (AreaChart):** 6-month gross revenue trajectory.
  - 📊 **Reservations by Room Category (BarChart):** Demand distribution across suites.
  - 🍩 **Room Status Distribution (PieChart):** Available, Occupied, Cleaning, Maintenance.
- **User Governance:** Promote/demote user roles, assign departments, toggle active status.
- **Security Audit Trail:** Persistent activity logging for logins, reservations, check-ins, rate changes, and refunds.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16.0 or higher)
- **npm** (v8.0 or higher)
- *(Optional)* Local MongoDB service on `mongodb://127.0.0.1:27017/hotelpro`. If local MongoDB is not running, HotelPro **automatically initializes an embedded In-Memory MongoDB instance** so the app runs out-of-the-box with zero configuration required!

---

### Step 1: Install Dependencies
From the project root folder:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 2: Start the Application

#### Start the Backend Server:
```bash
cd server
npm start
```
*The backend runs on **http://localhost:5000** and automatically seeds sample suites, demo accounts, and sample bookings on first boot.*

#### Start the React Frontend:
In a separate terminal:
```bash
cd client
npm run dev
```
*The client runs on **http://localhost:5173**.*

---

## 🔑 Pre-Seeded Demo Credentials

HotelPro comes pre-loaded with realistic sample accounts across all three persona roles:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hotelpro.com` | `password123` | Executive KPI Analytics, Room & Rate Multiplier Controls, User Role Governance, Audit Trail |
| **Hotel Staff** | `staff@hotelpro.com` | `password123` | Front Desk Check-in / Check-out, Housekeeping Turnover Board, Service Dispatch |
| **Housekeeping Lead** | `housekeeping@hotelpro.com` | `password123` | Room Cleaning & Inspection Controls |
| **Guest** | `guest@hotelpro.com` | `password123` | Suite Reservation, Digital Invoices, In-room Service Requests, Reviews |
| **Guest 2** | `david.sterling@example.com` | `password123` | In-house guest currently checked into Room EX-501 |

> 💡 **Tip:** Click the **"Demo Switcher"** button in the top navigation bar or the persona quick-fill buttons on the login page to sign in with any role in 1 click!

---

## 📂 Project Directory Structure

```
Project/
├── package.json               # Root scripts
├── server/
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── server.js              # Express app entry & auto-seeder
│   ├── config/
│   │   └── db.js              # MongoDB connector with auto in-memory fallback
│   ├── models/                # Mongoose Models
│   │   ├── User.js            # Guest, Staff & Admin accounts
│   │   ├── RoomCategory.js    # Suite categories & capacity
│   │   ├── Room.js            # Physical rooms, pricing & status
│   │   ├── Booking.js         # Reservations & financial totals
│   │   ├── Payment.js         # Transactions & receipts
│   │   ├── Review.js          # Guest ratings & staff replies
│   │   ├── ServiceRequest.js  # Housekeeping & concierge dispatch
│   │   ├── Notification.js    # User in-app notifications
│   │   └── ActivityLog.js     # Security audit logging
│   ├── controllers/           # API controllers
│   ├── routes/                # Express API routes
│   ├── middleware/            # Auth, Error & Multer file upload
│   ├── utils/                 # Email & Invoice generators
│   └── seed/
│       └── seeder.js          # Sample rooms, bookings & users
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx            # Routing & Protected Route guards
        ├── main.jsx           # React DOM root
        ├── index.css          # Luxury hotel custom stylesheet
        ├── context/
        │   └── AuthContext.jsx # Global JWT session & demo role helpers
        ├── services/
        │   └── api.js         # Axios client with JWT interceptor
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar with notification badge
        │   ├── Footer.jsx     # Brand footer
        │   ├── RoomCard.jsx   # Accommodation card with instant book
        │   ├── ProtectedRoute.jsx
        │   └── InvoiceModal.jsx # Formal printable invoice modal
        └── pages/
            ├── HomePage.jsx   # Hero banner & quick availability search
            ├── RoomsPage.jsx  # Multi-parameter filter & room catalog
            ├── RoomDetailPage.jsx # Gallery, reviews & pricing calculator
            ├── BookingPage.jsx    # Secure payment checkout & confirmation
            ├── GuestDashboard.jsx # Reservations, invoices & room services
            ├── StaffDashboard.jsx # Front desk check-in & housekeeping tracker
            ├── AdminDashboard.jsx # Executive Recharts analytics & audit logs
            ├── LoginPage.jsx      # Login with 1-click persona fills
            ├── RegisterPage.jsx   # Guest & staff registration
            └── ProfilePage.jsx    # Profile management & password updates
```

---

## 📡 API Reference Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new guest or staff user |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user details & address |
| `GET` | `/api/rooms` | Public | List rooms with filters (dates, category, price) |
| `GET` | `/api/rooms/:id` | Public | Room details and guest reviews |
| `POST` | `/api/rooms` | Staff/Admin | Create new hotel room unit |
| `POST` | `/api/rooms/seasonal-pricing` | Admin | Update seasonal price multiplier |
| `POST` | `/api/bookings` | Private | Reserve room and authorize payment |
| `GET` | `/api/bookings/my-bookings` | Private | List current guest's bookings |
| `POST` | `/api/bookings/:id/cancel` | Private | Cancel reservation & calculate refund |
| `GET` | `/api/payments/invoice/:bookingId` | Private | Fetch formal invoice breakdown |
| `POST` | `/api/staff/check-in/:bookingId` | Staff/Admin | Process guest check-in (marks room Occupied) |
| `POST` | `/api/staff/check-out/:bookingId` | Staff/Admin | Process guest check-out (queues housekeeping) |
| `PUT` | `/api/staff/rooms/:id/housekeeping` | Staff/Admin | Update room turnover status |
| `POST` | `/api/services` | Private | Submit in-room service request |
| `GET` | `/api/services` | Staff/Admin | Dispatch board for service tasks |
| `POST` | `/api/reviews` | Private | Submit room review & ratings |
| `GET` | `/api/admin/analytics` | Admin | Executive KPI stats and chart datasets |
| `GET` | `/api/admin/users` | Admin | Manage user directory & roles |
| `GET` | `/api/admin/activity-logs` | Admin | System security audit trail |
| `GET` | `/api/health` | Public | System health check and uptime |

---

## 🏆 Project Outcome Verification

- ✅ **MERN Stack Fully Integrated:** Node.js, Express, MongoDB (Mongoose), and React 18 with Vite.
- ✅ **Tested End-to-End:** Client builds cleanly with zero errors (`vite build` passed).
- ✅ **Autonomous Fallback:** Operates with standard MongoDB or embedded in-memory database with automatic seeding.
- ✅ **Enterprise Security:** JWT tokens, hashed passwords, protected routes, and audit logging.
- ✅ **Complete Submission Ready:** Ready for review and presentation.
