// Check-in Routes
const express = require('express');
const router = express.Router();
const { processCheckin, getBoardingPass, getSeatMap } = require('../controllers/checkinController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processCheckin);
router.get('/seats/:flightId', protect, getSeatMap);
router.get('/:id/boarding-pass', protect, getBoardingPass);

module.exports = router;
