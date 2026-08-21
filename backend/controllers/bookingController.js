const Booking = require('../models/Booking');
const Boat = require('../models/Boat');

function datesOverlap(startA, endA, startB, endB) {
  return new Date(endA) >= new Date(startB) && new Date(startA) <= new Date(endB);
}

exports.createBooking = (req, res) => {
  const boatId = req.params.boatId;
  const { startDate, endDate } = req.body;
  const renterId = req.user.id;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start and end dates are required.' });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: 'End date must be on or after the start date.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(startDate) < today) {
    return res.status(400).json({ message: 'Start date cannot be in the past.' });
  }

  Boat.getById(boatId, (err, boat) => {
    if (err || !boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (Number(boat.ownerId) === Number(renterId)) {
      return res.status(400).json({ message: 'You cannot book your own boat.' });
    }

    Booking.getByBoatId(boatId, (bookingErr, bookings) => {
      if (bookingErr) {
        return res.status(500).json({ message: 'Error checking availability.' });
      }

      const isAvailable = (bookings || []).every((booking) => {
        if (booking.status === 'rejected') return true;
        return !datesOverlap(startDate, endDate, booking.startDate, booking.endDate);
      });

      if (!isAvailable) {
        return res.status(400).json({ message: 'Boat is not available for the selected dates.' });
      }

      Booking.create(
        {
          boatId,
          renterId,
          startDate,
          endDate,
          status: 'pending',
        },
        (createErr, booking) => {
          if (createErr) {
            return res.status(500).json({ message: 'Error creating booking.' });
          }
          res.status(201).json({
            message: 'Booking request submitted.',
            booking: { ...booking, boatId, startDate, endDate, status: 'pending' },
          });
        }
      );
    });
  });
};

exports.getBookingsByBoatOwner = (req, res) => {
  const ownerId = req.user.id;
  const boatId = req.params.boatId;

  Boat.getById(boatId, (err, boat) => {
    if (err || !boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (Number(boat.ownerId) !== Number(ownerId)) {
      return res.status(403).json({ message: 'Forbidden: You do not own this boat.' });
    }

    Booking.getByBoatId(boatId, (bookingErr, bookings) => {
      if (bookingErr) {
        return res.status(500).json({ message: 'Error fetching bookings.' });
      }
      res.json({ bookings });
    });
  });
};

exports.updateBookingStatus = (req, res) => {
  const ownerId = req.user.id;
  const boatId = req.params.boatId;
  const bookingId = req.params.bookingId;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  Boat.getById(boatId, (err, boat) => {
    if (err || !boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (Number(boat.ownerId) !== Number(ownerId)) {
      return res.status(403).json({ message: 'Forbidden: You do not own this boat.' });
    }

    Booking.updateStatus(bookingId, status, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: 'Error updating booking status.' });
      }
      res.json({ message: 'Booking status updated.', status });
    });
  });
};

exports.getBookingsByRenter = (req, res) => {
  Booking.getDetailedByRenterId(req.user.id, (err, bookings) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching bookings.' });
    }
    res.json({ bookings });
  });
};

exports.getIncomingBookings = (req, res) => {
  Booking.getDetailedByOwnerId(req.user.id, (err, bookings) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching bookings.' });
    }
    res.json({ bookings });
  });
};
