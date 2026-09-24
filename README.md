# FlyNow Airlines Reservation System

A complete MERN stack  web application for booking flights, checking in, and managing reservations with a responsive glassmorphism UI.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Modern Glassmorphism, animations, grid/flexbox), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Features**: JWT Authentication, dynamic seasonal pricing, simulated payment processing, QR Code boarding pass generation, page transition animations.

---

## 🚀 Run Instructions (Local)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running on `localhost:27017`

### 2. Setup
1. Open terminal in the project root folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. A `.env` file is already created in the project root with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/airline-reservation
   JWT_SECRET=supersecretjwtkey_airline_reservation_12345
   NODE_ENV=development
   ```

### 3. Database Seeding (Sample Data)
Seed the database with sample Users, Flights, Bookings, and Payments:
```bash
npm run seed
```
*(This logs "Data Imported!" and populates 10 flights, 2 users, and 2 bookings).*

### 4. Start the Application
Start the development server:
```bash
npm start
```
Go to your browser and access:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🌐 Deployment Guide

### A. MongoDB Atlas Database Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to "Database Access" and create a database user with read/write access.
3. Go to "Network Access" and allow connections from everywhere (`0.0.0.0/0`).
4. Get your connection string (URI) and replace `<password>` with your DB user's password.

### B. Deploy Backend (Render / Heroku)
Since we serve the frontend statically from the backend in this unified codebase, you can deploy the entire repository as a single Node Web Service.
1. Push this project to a GitHub repository.
2. Go to [Render](https://render.com/) or another platform.
3. Create a **New Web Service**, connect your GitHub repo.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
7. Deploy! Your app will be live on Render handling both API and static HTML frontend.

*(Alternatively, to split them specifically per instructions:)*

### C. Deploy Frontend Only (Netlify)
If you specifically want to split the frontend out:
1. Update `API_URL` in `frontend/js/app.js` to point to your live Render backend URL (`https://your-backend.onrender.com/api`).
2. Login to [Netlify](https://www.netlify.com/).
3. Drag and drop the `frontend` folder into Netlify to deploy.
4. Ensure the backend has CORS enabled and allows requests from your Netlify domain.

---

## 🎯 Features Implemented
- **Animations**: Airplane page transitions using CSS clip-path interpolation.
- **Flight Search**: Filters flights dynamically.
- **Seasonal Pricing**: Logic built into Node backend (20% increase in Peak seasons like June-August, December; 10% decrease otherwise).
- **Booking Flow**: Select flight, create booking, simulate payment to status changes.
- **Check-in Engine**: Validates paid status, selects seats, and generates an SVG QR Code as a boarding pass.
- **Post-Booking Modal**: Showing destination data (Weather, Currency tips) and simulated WhatsApp alerts on successful booking.
