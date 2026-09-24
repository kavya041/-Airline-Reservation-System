const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const Flight = require('./backend/models/Flight');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const addFlights = async () => {
    try {
        await connectDB();

        // Current time: 2026-04-12T03:17:44
        const now = new Date('2026-04-12T03:17:44').getTime();

        const flights = [
            {
                flightId: 'FL-TDR-01',
                airlineName: 'FlyNow Express',
                source: 'Mumbai',
                destination: 'Bangalore',
                departureTime: new Date(now + 1.2 * 3600 * 1000), // ~1 hour 12 mins from now
                arrivalTime: new Date(now + 3.2 * 3600 * 1000),
                basePrice: 12000,
                seatsAvailable: 60
            },
            {
                flightId: 'FL-TDR-02',
                airlineName: 'SkyHigh Connect',
                source: 'Delhi',
                destination: 'Mumbai',
                departureTime: new Date(now + 1.5 * 3600 * 1000), // 1.5 hours from now
                arrivalTime: new Date(now + 4.0 * 3600 * 1000),
                basePrice: 12000,
                seatsAvailable: 50
            }
        ];

        for (const f of flights) {
            await Flight.updateOne(
                { flightId: f.flightId },
                { $set: f },
                { upsert: true }
            );
        }

        console.log('✅ Successfully added 2 flights for today (Check-in ready)');
        console.log('Flight 1:', flights[0].flightId, 'at', flights[0].departureTime.toISOString());
        console.log('Flight 2:', flights[1].flightId, 'at', flights[1].departureTime.toISOString());
        
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

addFlights();
