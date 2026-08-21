const express = require('express');
const bookingController = require('../controllers/bookingController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/mine', ensureAuthenticated, bookingController.getBookingsByRenter);
router.get('/incoming', ensureAuthenticated, bookingController.getIncomingBookings);

module.exports = router;
