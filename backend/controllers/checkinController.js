// Check-in Controller - enforces 2-day window, seat selection, boarding pass generation
const Booking = require('../models/Booking');
const QRCode = require('qrcode');

// @desc  Process check-in, select seats, generate boarding pass
// @route POST /api/checkin
const processCheckin = async (req, res) => {
    try {
        const { bookingId, seatSelections, idType, idNumber } = req.body;

        const booking = await Booking.findById(bookingId).populate('flightId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Paid' && booking.status !== 'Checked-In') {
            return res.status(400).json({ message: 'Please complete payment before check-in.' });
        }

        // ✅ Enforce 2-hours before departure check-in rule
        const now = new Date();
        const departure = new Date(booking.flightId.departureTime);
        const diffMs = departure - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours > 2) {
            return res.status(400).json({
                message: `Check-in is not available yet. Check-in opens 2 hours before departure.`,
                checkInOpenTime: new Date(departure - 2 * 60 * 60 * 1000)
            });
        }

        if (diffHours < 0) {
            return res.status(400).json({ message: 'Flight has already departed. Check-in is closed.' });
        }

        // Validate ID fields
        if (!idType || !idNumber) {
            return res.status(400).json({ message: 'ID Type and ID Number are required for check-in.' });
        }

        // Update seats for passengers
        if (seatSelections && seatSelections.length === booking.passengerDetails.length) {
            booking.passengerDetails.forEach((passenger, index) => {
                passenger.seatNumber = seatSelections[index];
            });
        }

        booking.idType = idType;
        booking.idNumber = idNumber;
        booking.status = 'Checked-In';
        await booking.save();

        // Generate QR Code for Boarding Pass
        const qrContent = JSON.stringify({
            bookingRef: booking.bookingId,
            flight: booking.flightId.flightId,
            airline: booking.flightId.airlineName,
            from: booking.flightId.source,
            to: booking.flightId.destination,
            departure: booking.flightId.departureTime,
            seats: booking.passengerDetails.map(p => p.seatNumber || 'N/A').join(','),
            passengers: booking.passengerDetails.length
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrContent, { width: 250 });

        booking.qrCodeUrl = qrCodeDataUrl;
        booking.status = 'Boarding Pass Generated';
        await booking.save();

        res.json({
            message: 'Check-in successful! Your Boarding Pass has been generated.',
            booking,
            qrCode: qrCodeDataUrl
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get boarding pass for a booking
// @route GET /api/checkin/:id/boarding-pass
const getBoardingPass = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('flightId');

        if (!booking || !booking.qrCodeUrl) {
            return res.status(404).json({ message: 'Boarding pass not found. Please check-in first.' });
        }

        // Advance status to Ready to Fly when pass is viewed
        if (booking.status === 'Boarding Pass Generated') {
            booking.status = 'Ready to Fly';
            await booking.save();
        }

        res.json({
            bookingId: booking.bookingId,
            flight: booking.flightId,
            passengers: booking.passengerDetails,
            qrCode: booking.qrCodeUrl,
            status: booking.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get seat map for a flight (available + booked seats for a given flight)
// @route GET /api/checkin/seats/:flightId
const getSeatMap = async (req, res) => {
    try {
        const { flightId } = req.params;

        // Find all non-cancelled bookings for this flight
        const bookings = await Booking.find({
            flightId,
            status: { $ne: 'Cancelled' }
        });

        // Collect all taken seats
        const takenSeats = [];
        bookings.forEach(b => {
            b.passengerDetails.forEach(p => {
                if (p.seatNumber) takenSeats.push(p.seatNumber);
            });
        });

        // Generate a full seat layout (6 rows × 6 cols = 36 seats for simple demo)
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const allSeats = [];
        cols.forEach(col => {
            rows.forEach(row => {
                const seatId = `${col}${row}`;
                allSeats.push({
                    seatId,
                    available: !takenSeats.includes(seatId)
                });
            });
        });

        res.json({ allSeats, takenSeats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { processCheckin, getBoardingPass, getSeatMap };
