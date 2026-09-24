const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const Flight = require('./backend/models/Flight');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const addFlights = async () => {
    try {
        await connectDB();

        // Use custom now based on feedback (2026-04-12T00:20:25)
        const now = new Date('2026-04-12T00:20:25').getTime();

        const flights = [
            {
                flightId: 'FL-TODAY-01',
                airlineName: 'SkyHigh Premium',
                source: 'Mumbai',
                destination: 'Delhi',
                departureTime: new Date(now + 1.5 * 3600 * 1000), // 1.5 hours from now
                arrivalTime: new Date(now + 3.5 * 3600 * 1000),
                basePrice: 12000,
                seatsAvailable: 60
            },
            {
                flightId: 'FL-TODAY-02',
                airlineName: 'FlyNow Elite',
                source: 'Bangalore',
                destination: 'Chennai',
                departureTime: new Date(now + 1.8 * 3600 * 1000), // 1.8 hours from now
                arrivalTime: new Date(now + 2.8 * 3600 * 1000),
                basePrice: 12000,
                seatsAvailable: 50
            },
            {
                flightId: 'FL-TODAY-03',
                airlineName: 'Oceanic Pride',
                source: 'Hyderabad',
                destination: 'Kolkata',
                departureTime: new Date(now + 1.2 * 3600 * 1000), // 1.2 hours from now
                arrivalTime: new Date(now + 3.2 * 3600 * 1000),
                basePrice: 12000,
                seatsAvailable: 40
            }
        ];

        // We use updateOne with upsert to avoid duplicate key errors if run twice
        for (const f of flights) {
            await Flight.updateOne(
                { flightId: f.flightId },
                { $set: f },
                { upsert: true }
            );
        }

        console.log('✅ Successfully added 3 flights for today with cost 12,000');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

addFlights();
