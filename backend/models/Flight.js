const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flightId: {
        type: String,
        required: true,
        unique: true
    },
    airlineName: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    seatsAvailable: {
        type: Number,
        required: true,
        default: 60
    }
}, { timestamps: true });

module.exports = mongoose.model('Flight', FlightSchema);
