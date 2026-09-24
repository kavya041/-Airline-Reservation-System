const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Flight = require('./models/Flight');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Flight.deleteMany();
        await Booking.deleteMany();
        await Payment.deleteMany();

        // 1. Users (3 records: 1 admin + 2 regular)
        await User.deleteMany();
        const user1 = await User.create({ name: 'John Doe',   email: 'john@example.com',  password: 'password123', phone: '+1-555-0101', role: 'user' });
        const user2 = await User.create({ name: 'Jane Smith', email: 'jane@example.com',  password: 'password123', phone: '+1-555-0102', role: 'user' });
        // Admin user — login at /login.html with the Admin tab
        await User.create({               name: 'Admin User', email: 'admin@FlyNow.com', password: 'admin123',    phone: '+1-555-0001', role: 'admin' });
        console.log('✅ Users seeded (admin@FlyNow.com / admin123)');


        // 2. Flights (10 records)
        const flights = [
            { flightId: 'FL001', airlineName: 'FlyNow Airlines', source: 'New York', destination: 'London', departureTime: new Date(Date.now() + 86400000), arrivalTime: new Date(Date.now() + 115200000), basePrice: 12000, seatsAvailable: 60 },
            { flightId: 'FL002', airlineName: 'Oceanic Air', source: 'Los Angeles', destination: 'Tokyo', departureTime: new Date(Date.now() + 172800000), arrivalTime: new Date(Date.now() + 216000000), basePrice: 800, seatsAvailable: 45 },
            { flightId: 'FL003', airlineName: 'Global Wings', source: 'London', destination: 'Paris', departureTime: new Date(Date.now() + 259200000), arrivalTime: new Date(Date.now() + 266400000), basePrice: 150, seatsAvailable: 120 },
            { flightId: 'FL004', airlineName: 'FlyNow Airlines', source: 'Dubai', destination: 'Mumbai', departureTime: new Date(Date.now() + 345600000), arrivalTime: new Date(Date.now() + 356400000), basePrice: 300, seatsAvailable: 80 },
            { flightId: 'FL005', airlineName: 'Oceanic Air', source: 'Sydney', destination: 'Singapore', departureTime: new Date(Date.now() + 432000000), arrivalTime: new Date(Date.now() + 460800000), basePrice: 600, seatsAvailable: 50 },
            { flightId: 'FL006', airlineName: 'Global Wings', source: 'Paris', destination: 'Berlin', departureTime: new Date(Date.now() + 518400000), arrivalTime: new Date(Date.now() + 525600000), basePrice: 100, seatsAvailable: 100 },
            { flightId: 'FL007', airlineName: 'FlyNow Airlines', source: 'New York', destination: 'Miami', departureTime: new Date(Date.now() + 604800000), arrivalTime: new Date(Date.now() + 615600000), basePrice: 200, seatsAvailable: 40 },
            { flightId: 'FL008', airlineName: 'Oceanic Air', source: 'Los Angeles', destination: 'Chicago', departureTime: new Date(Date.now() + 691200000), arrivalTime: new Date(Date.now() + 705600000), basePrice: 250, seatsAvailable: 55 },
            { flightId: 'FL009', airlineName: 'Global Wings', source: 'Tokyo', destination: 'Seoul', departureTime: new Date(Date.now() + 777600000), arrivalTime: new Date(Date.now() + 784800000), basePrice: 400, seatsAvailable: 90 },
            { flightId: 'FL010', airlineName: 'FlyNow Airlines', source: 'Mumbai', destination: 'Delhi', departureTime: new Date(Date.now() + 864000000), arrivalTime: new Date(Date.now() + 871200000), basePrice: 80, seatsAvailable: 150 },
            // Demo flights scheduled relative to NOW (Current User Time: ~1:30 PM)
            // FL011 Departs at ~4:30 PM (3 hours from now). Check-in opens at ~2:30 PM (2 hours before)
            { flightId: 'FL011', airlineName: 'Global Wings', source: 'Mumbai', destination: 'Delhi', departureTime: new Date(Date.now() + 3 * 3600 * 1000), arrivalTime: new Date(Date.now() + 5 * 3600 * 1000), basePrice: 120, seatsAvailable: 150 },
            // FL012 Departs at ~5:00 PM (3.5 hours from now). Check-in opens at ~3:00 PM
            { flightId: 'FL012', airlineName: 'FlyNow Airlines', source: 'Bangalore', destination: 'Chennai', departureTime: new Date(Date.now() + 3.5 * 3600 * 1000), arrivalTime: new Date(Date.now() + 4.5 * 3600 * 1000), basePrice: 100, seatsAvailable: 100 }
        ];
        const createdFlights = await Flight.insertMany(flights);

        // 3. Bookings (2 sample)
        const b1 = await Booking.create({
            bookingId: 'BKG1001',
            userId: user1._id,
            flightId: createdFlights[0]._id,
            passengerDetails: [{ name: 'John Doe', age: 30, gender: 'Male' }],
            totalPrice: 12000,
            status: 'Booked'
        });

        const b2 = await Booking.create({
            bookingId: 'BKG1002',
            userId: user2._id,
            flightId: createdFlights[1]._id,
            passengerDetails: [{ name: 'Jane Smith', age: 28, gender: 'Female' }],
            totalPrice: 800,
            status: 'Paid'
        });

        const b3 = await Booking.create({
            bookingId: 'BKG2026',
            userId: user1._id,
            flightId: createdFlights[createdFlights.length - 2]._id, // FL011
            passengerDetails: [{ name: 'John Doe', age: 30, gender: 'Male' }],
            totalPrice: 120,
            status: 'Paid'
        });

        // 4. Payments (2 sample)
        await Payment.create([
            { paymentId: 'PAY1001', bookingId: b1._id, amount: 12000, status: 'Pending' },
            { paymentId: 'PAY1002', bookingId: b2._id, amount: 800, status: 'Success' },
            { paymentId: 'PAY2026', bookingId: b3._id, amount: 120, status: 'Success' }
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
