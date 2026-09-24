# Core Functional Requirements: FlyNow Airline Reservation System

The following five functional requirements define the primary operations and value propositions of the FlyNow platform.

### 1. User Authentication and Profile Security
The system shall provide a secure registration and login mechanism using JWT (JSON Web Tokens). It must securely store and manage passenger profiles, including personal information, contact details, and a comprehensive history of all previous and upcoming bookings.

### 2. Flight Discovery with Dynamic Seasonal Pricing
The system shall enable users to search for flights based on origin, destination, and date. The platform must implement a dynamic pricing engine that automatically adjusts ticket costs (+20% for peak seasons like June/December, -10% for off-peak) to optimize revenue and passenger load.

### 3. Integrated Booking and Payment Simulation
The system shall facilitate a seamless end-to-end booking journey. This includes seat selection and a simulated payment gateway that provides real-time transaction responses (Approve/Decline). Upon successful payment, the system must generate a unique Passenger Name Record (PNR) and update the flight's available capacity.

### 4. Digital Check-In and Boarding Pass Generation
The system shall offer an online check-in feature accessible to passengers with confirmed bookings starting 24 hours before departure. This process must generate a digital boarding pass in a secure format, featuring an embedded QR code for seamless airport processing.

### 5. Administrative Dashboard and Operational Management
The system shall provide a dedicated administrative interface. This dashboard must allow authorized personnel to manage flight schedules (Create, Read, Update, Delete), monitor real-time booking statistics, and oversee general system performance and passenger inquiries.
