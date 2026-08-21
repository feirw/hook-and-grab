// models/Booking.js
const { getDatabaseConnection } = require('../config/database');

class Booking {
  // Create a new booking entry in the database
  static create(bookingData, callback) {
    const { boatId, renterId, startDate, endDate, status } = bookingData;
    const db = getDatabaseConnection();

    db.run(
      `
      INSERT INTO bookings 
      (boatId, renterId, startDate, endDate, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [boatId, renterId, startDate, endDate, status],
      function (err) {
        db.close();
        if (err) {
          return callback(err);
        }
        return callback(null, { id: this.lastID });
      }
    );
  }

  // Retrieve all bookings for a specific boat
  static getByBoatId(boatId, callback) {
    const db = getDatabaseConnection();
    db.all('SELECT * FROM bookings WHERE boatId = ?', [boatId], (err, bookings) => {
      db.close();
      if (err) {
        return callback(err);
      }
      return callback(null, bookings);
    });
  }

  // Retrieve a booking by its ID
  static getById(id, callback) {
    const db = getDatabaseConnection();
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
      db.close();
      if (err) {
        return callback(err);
      }
      return callback(null, booking);
    });
  }

  // Update the status of a booking
  static updateStatus(id, status, callback) {
    const db = getDatabaseConnection();
    db.run(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id],
      function (err) {
        db.close();
        if (err) {
          return callback(err);
        }
        return callback(null);
      }
    );
  }

  static getByRenterId(renterId, callback) {
    const db = getDatabaseConnection();
    db.all('SELECT * FROM bookings WHERE renterId = ?', [renterId], (err, bookings) => {
      db.close();
      if (err) {
        return callback(err);
      }
      return callback(null, bookings);
    });
  }

  static getDetailedByRenterId(renterId, callback) {
    const db = getDatabaseConnection();
    db.all(
      `SELECT bookings.*, boats.title AS boatTitle, boats.location AS boatLocation, boats.pricePerDay
       FROM bookings
       JOIN boats ON boats.id = bookings.boatId
       WHERE bookings.renterId = ?
       ORDER BY bookings.startDate DESC`,
      [renterId],
      (err, bookings) => {
        db.close();
        if (err) return callback(err);
        return callback(null, bookings);
      }
    );
  }

  static getDetailedByOwnerId(ownerId, callback) {
    const db = getDatabaseConnection();
    db.all(
      `SELECT bookings.*, boats.title AS boatTitle, boats.location AS boatLocation, users.username AS renterUsername
       FROM bookings
       JOIN boats ON boats.id = bookings.boatId
       LEFT JOIN users ON users.id = bookings.renterId
       WHERE boats.ownerId = ?
       ORDER BY bookings.startDate DESC`,
      [ownerId],
      (err, bookings) => {
        db.close();
        if (err) return callback(err);
        return callback(null, bookings);
      }
    );
  }
}

module.exports = Booking;
