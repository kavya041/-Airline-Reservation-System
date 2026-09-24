const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const processPayment = async (req, res) => {
    try {
        const { bookingId, amount, cardDetails } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Simulate payment success/failure randomly (or just success for demo)
        const isSuccess = Math.random() > 0.1; // 90% success rate

        const paymentId = 'PAY' + Math.floor(Math.random() * 1000000);

        const payment = await Payment.create({
            paymentId,
            bookingId,
            amount,
            status: isSuccess ? 'Success' : 'Failed'
        });

        if (isSuccess) {
            booking.status = 'Paid';
            await booking.save();
            res.json({ message: 'Payment successful', payment });
        } else {
            res.status(400).json({ message: 'Payment failed. Try again.', payment });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { processPayment };
