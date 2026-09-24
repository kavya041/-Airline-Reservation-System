const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    dob: { type: Date }, // Added DOB
    gender: { type: String, required: true },
    passportNumber: { type: String },
    seatNumber: { type: String }
});

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    passengerDetails: [PassengerSchema],
    numPassengers: {
        type: Number,
        default: 1
    },
    class: {
        type: String,
        enum: ['Economy', 'Business'],
        default: 'Economy'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Booked', 'Paid', 'Checked-In', 'Boarding Pass Generated', 'Ready to Fly', 'Cancelled'],
        default: 'Booked'
    },
    idType: {
        type: String,
        enum: ['Aadhaar', 'Passport', 'Driving License']
    },
    idNumber: {
        type: String
    },
    qrCodeUrl: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
