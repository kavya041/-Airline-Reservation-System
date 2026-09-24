// Admin Controller - manage flights, bookings, and users
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const User = require('../models/User');

// ==================== ADMIN FLIGHT MANAGEMENT ====================

// @desc  Get all flights (admin)
// @route GET /api/admin/flights
const getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ departureTime: 1 });
        res.json(flights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Add a new flight
// @route POST /api/admin/flights
const addFlight = async (req, res) => {
    try {
        const { flightId, airlineName, source, destination, departureTime, arrivalTime, basePrice, seatsAvailable } = req.body;
        const existing = await Flight.findOne({ flightId });
        if (existing) return res.status(400).json({ message: 'Flight ID already exists' });

        const flight = await Flight.create({
            flightId,
            airlineName,
            source,
            destination,
            departureTime,
            arrivalTime,
            basePrice,
            seatsAvailable: seatsAvailable || 60
        });
        res.status(201).json(flight);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Update a flight
// @route PUT /api/admin/flights/:id
const updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        res.json(flight);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Delete a flight
// @route DELETE /api/admin/flights/:id
const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });
        res.json({ message: 'Flight deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ADMIN BOOKING MANAGEMENT ====================

// @desc  Get all bookings (admin)
// @route GET /api/admin/bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('flightId', 'airlineName source destination departureTime flightId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ADMIN USER MANAGEMENT ====================

// @desc  Get all users (admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Delete a user (admin)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Get dashboard stats summary
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
        const paidBookings = await Booking.countDocuments({ status: { $ne: 'Cancelled' } });
        // Sum revenue from paid bookings
        const revenue = await Booking.aggregate([
            { $match: { status: { $in: ['Paid', 'Checked-In', 'Boarding Pass Generated', 'Ready to Fly'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        res.json({
            totalFlights,
            totalBookings,
            totalUsers,
            cancelledBookings,
            paidBookings,
            totalRevenue: revenue[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllFlights, addFlight, updateFlight, deleteFlight, getAllBookings, getAllUsers, deleteUser, getDashboardStats };
