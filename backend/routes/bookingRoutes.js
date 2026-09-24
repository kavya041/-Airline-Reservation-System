const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, getMyBookings);

router.route('/:id')
    .delete(protect, cancelBooking);

module.exports = router;
