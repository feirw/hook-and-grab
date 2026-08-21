const Boat = require('../models/Boat');
const { encodeImages } = require('../utils/images');
const { validateBoatListing } = require('../validations/boatValidation');

function withImages(boat) {
  return { ...boat, images: encodeImages(boat.images) };
}

exports.createBoat = (req, res) => {
  const { errors, isValid } = validateBoatListing(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const boatData = {
    ownerId: req.user.id,
    title: req.body.title,
    description: req.body.description,
    pricePerDay: parseFloat(req.body.pricePerDay) || 0,
    location: req.body.location,
    images: req.files ? req.files.map((file) => `/uploads/boats/${file.filename}`) : [],
    datePosted: new Date().toISOString(),
  };

  Boat.create(boatData, (err, boat) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating boat listing.' });
    }
    res.status(201).json({
      message: 'Boat listed successfully.',
      boat: withImages({
        ...boatData,
        ...boat,
        images: boatData.images.join(';'),
        ownerUsername: req.user.username,
        ownerEmail: req.user.email,
        ownerPhone: req.user.phone,
      }),
    });
  });
};

exports.getAllBoats = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;

  Boat.getAll(limit, offset, (err, boats) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching boats.' });
    }
    res.json({ boats: boats.map(withImages) });
  });
};

exports.getBoatById = (req, res) => {
  Boat.getById(req.params.id, (err, boat) => {
    if (err || !boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }
    res.json({ boat: withImages(boat) });
  });
};

exports.deleteBoat = (req, res) => {
  const boatId = req.params.id;
  const userId = req.user.id;

  Boat.getById(boatId, (err, boat) => {
    if (err || !boat) {
      return res.status(404).json({ message: 'Boat not found.' });
    }

    if (Number(boat.ownerId) !== Number(userId)) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this boat.' });
    }

    Boat.deleteById(boatId, (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting boat.' });
      }
      res.json({ message: 'Boat deleted successfully.' });
    });
  });
};

exports.getMyBoats = (req, res) => {
  Boat.getByOwnerId(req.user.id, (err, boats) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching boats.' });
    }
    res.json({ boats: boats.map(withImages) });
  });
};
