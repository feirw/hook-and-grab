const User = require('../models/User');
const Product = require('../models/Product');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const { encodeImages } = require('../utils/images');

exports.getCurrentUser = (req, res) => {
  if (req.user) {
    User.findById(req.user.id, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving user data.' });
      }
      res.json({ user });
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.updateProfilePicture = (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ message: 'Profile picture is required.' });
  }
  const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

  User.updateProfilePicture(userId, profilePicturePath, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating profile picture.' });
    }
    res.json({ message: 'Profile picture updated successfully.', user });
  });
};

exports.deleteAccount = (req, res) => {
  const userId = req.user.id;
  User.deleteById(userId, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting user.' });
    }
    req.logout(() => {
      res.json({ message: 'Account deleted successfully.' });
    });
  });
};

exports.searchUsers = (req, res) => {
  const keyword = req.query.keyword;

  User.search(keyword, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching users.' });
    }
    res.json({ users });
  });
};

exports.getMyActivity = (req, res) => {
  const userId = req.user.id;

  Product.getBySellerId(userId, (productErr, products) => {
    if (productErr) {
      return res.status(500).json({ message: 'Error fetching activity.' });
    }

    Boat.getByOwnerId(userId, (boatErr, boats) => {
      if (boatErr) {
        return res.status(500).json({ message: 'Error fetching activity.' });
      }

      Booking.getDetailedByRenterId(userId, (renterErr, myBookings) => {
        if (renterErr) {
          return res.status(500).json({ message: 'Error fetching activity.' });
        }

        Booking.getDetailedByOwnerId(userId, (ownerErr, incomingBookings) => {
          if (ownerErr) {
            return res.status(500).json({ message: 'Error fetching activity.' });
          }

          res.json({
            products: (products || []).map((product) => ({
              ...product,
              images: encodeImages(product.images),
            })),
            boats: (boats || []).map((boat) => ({
              ...boat,
              images: encodeImages(boat.images),
            })),
            myBookings: myBookings || [],
            incomingBookings: incomingBookings || [],
          });
        });
      });
    });
  });
};
