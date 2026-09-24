// Admin Routes - protected by both 'protect' and 'adminOnly' middleware
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllFlights,
    addFlight,
    updateFlight,
    deleteFlight,
    getAllBookings,
    getAllUsers,
    deleteUser,
    getDashboardStats
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Flight management
router.get('/flights', getAllFlights);
router.post('/flights', addFlight);
router.put('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

// Booking management
router.get('/bookings', getAllBookings);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
