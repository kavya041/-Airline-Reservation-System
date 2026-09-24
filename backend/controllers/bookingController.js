const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Notification = require('../models/Notification');

const createBooking = async (req, res) => {
    try {
        const { flightId, passengerDetails, totalPrice } = req.body;

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        if (flight.seatsAvailable < passengerDetails.length) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        // Generate unique booking ID
        const bookingId = 'BKG' + Math.floor(Math.random() * 1000000);

        const booking = await Booking.create({
            bookingId,
            userId: req.user._id,
            flightId,
            passengerDetails,
            totalPrice,
            status: 'Booked'
        });

        flight.seatsAvailable -= passengerDetails.length;
        await flight.save();

        // Simulate WhatsApp / SMS Notification in DB
        await Notification.create({
            userId: req.user._id,
            type: 'WhatsApp',
            message: `Booking Confirmed! ID: ${bookingId}. Complete payment to finalize.`
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('flightId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('flightId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        const now = new Date();
        const departure = new Date(booking.flightId.departureTime);
        const diffMs = departure - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 0) {
            return res.status(400).json({ message: 'Cannot cancel after flight departure' });
        }

        let fee = 0;
        if (diffHours > 48) {
            fee = 200;
        } else if (diffHours >= 24) {
            fee = 500;
        } else if (diffHours >= 2) {
            fee = 1000;
        } else {
            return res.status(400).json({ message: 'Cancellation not allowed less than 2 hours before departure' });
        }

        booking.status = 'Cancelled';
        await booking.save();

        // Restore seats
        const flight = await Flight.findById(booking.flightId);
        if (flight) {
            flight.seatsAvailable += booking.passengerDetails.length;
            await flight.save();
        }

        const refundAmount = booking.totalPrice - fee;

        // ✅ Send simulator message (Notification)
        await Notification.create({
            userId: req.user._id,
            type: 'WhatsApp',
            message: `Booking ${booking.bookingId} cancelled. Refund of ₹${refundAmount > 0 ? refundAmount : 0} initiated to your account.`
        });

        res.json({
            message: `Booking cancelled successfully.`,
            ticketPrice: booking.totalPrice,
            cancellationFee: fee,
            refundAmount: refundAmount > 0 ? refundAmount : 0,
            refundTimeline: '3-5 Business Days',
            status: 'Cancelled',
            bookingId: booking.bookingId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
