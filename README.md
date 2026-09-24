# Airline-Reservation-System
A responsive airline reservation system built with HTML, CSS, and JavaScript for searching flights, booking tickets, managing reservations, and validating passenger details.
===============================================================================
                    ✈️ FLYNOW AIRLINE RESERVATION SYSTEM ✈️
===============================================================================

Welcome to FlyNow — a robust, full-stack airline reservation platform built 
with Node.js, Express, and MongoDB. Designed for speed, scalability, and seamless
user experiences, FlyNow delivers end-to-end travel management features for 
passengers and airline administrators alike.

-------------------------------------------------------------------------------
   CORE FEATURES & CAPABILITIES
-------------------------------------------------------------------------------

•  User Authentication & Security
  - Secure JWT-based user registration and login.
  - Complete personal booking history tracking and profile management.

•  Flight Discovery & Dynamic Seasonal Pricing
  - Flexible flight search by origin, destination, and departure date.
  - Smart pricing logic: +20% peak season rates (June & December) and -10% 
    off-peak discounts applied automatically.

•  Integrated Payment Processing Simulation
  - Advanced credit card validation using Luhn's Algorithm.
  - CVV verification, network detection, and real-time transaction logging.

•  Digital Check-In & Mobile Boarding Passes
  - Automated check-in window opening 24 hours prior to departure.
  - Real-time QR code generation for digital boarding passes.

• Administrative Operations Dashboard
  - Complete CRUD operations for flight schedule management.
  - Real-time operational oversight and seat inventory tracking.

-------------------------------------------------------------------------------
  📂 PROJECT STRUCTURE & KEY FILES
-------------------------------------------------------------------------------

├── backend/
│   └── server.js               --> Primary Express application entry point
├── add_two_flights.js          --> Database seeder script for sample flights
├── credit_card_processor.py    --> Standalone Python module for payment tests
├── .env                        --> Environment variables & database config
└── functional_requirements.md  --> Detailed system requirements documentation

-------------------------------------------------------------------------------
  💻 SYSTEM REQUIREMENTS & PREREQUISITES
-------------------------------------------------------------------------------

• Node.js  : v12.0.0 or higher
• MongoDB  : Local instance running on port 27017 (or custom URI)
• Python 3 : Required only for standalone payment validation tests

-------------------------------------------------------------------------------
  ⚙️ ENVIRONMENT CONFIGURATION
-------------------------------------------------------------------------------

Create a `.env` file in the root directory with the following variables:

    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/airline-reservation
    JWT_SECRET=supersecretjwtkey_airline_reservation_12345
    NODE_ENV=development

-------------------------------------------------------------------------------
  🚀 QUICK START GUIDE
-------------------------------------------------------------------------------

1. INSTALL DEPENDENCIES
   Execute in your command line:
   
   $ npm install

2. SEED THE DATABASE
   Populate MongoDB with sample flight inventory:
   
   $ node add_two_flights.js
   
   (Alternative seed command: npm run seed)

3. LAUNCH THE SERVER
   
   • Development Mode (Auto-reloads on file changes):
     $ npm run dev

   • Production Mode:
     $ npm start

   The server will start listening at: http://localhost:5000

-------------------------------------------------------------------------------
  💳 TESTING THE PAYMENT PROCESSOR MODULE
-------------------------------------------------------------------------------

To execute standalone payment validation and credit card algorithm tests:

    $ python credit_card_processor.py

===============================================================================
               Thank you for exploring FlyNow! Happy flying! ✈️
===============================================================================
