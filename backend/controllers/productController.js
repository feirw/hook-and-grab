const Product = require('../models/Product');
const { encodeImages, toBoolean } = require('../utils/images');
const { validateProductListing } = require('../validations/productValidation');

function withImages(product) {
  return { ...product, images: encodeImages(product.images) };
}

exports.createProduct = (req, res) => {
  const { errors, isValid } = validateProductListing(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const isFree = toBoolean(req.body.isFree);
  const productData = {
    title: req.body.title,
    description: req.body.description,
    price: isFree ? 0 : parseFloat(req.body.price) || 0,
    isFree,
    isOpenToTrade: toBoolean(req.body.isOpenToTrade),
    images: req.files ? req.files.map((file) => `/uploads/products/${file.filename}`) : [],
    datePosted: new Date().toISOString(),
    sellerId: req.user.id,
  };

  Product.create(productData, (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating product.' });
    }
    res.status(201).json({
      message: 'Product posted successfully.',
      product: withImages({
        ...productData,
        ...product,
        images: productData.images.join(';'),
        sellerUsername: req.user.username,
        sellerEmail: req.user.email,
        sellerPhone: req.user.phone,
      }),
    });
  });
};

exports.getAllProducts = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;

  Product.getAll(limit, offset, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching products.' });
    }
    res.json({ products: products.map(withImages) });
  });
};

exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, product) => {
    if (err || !product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product: withImages(product) });
  });
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  Product.getById(productId, (err, product) => {
    if (err || !product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (Number(product.sellerId) !== Number(userId)) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this product.' });
    }

    Product.deleteById(productId, (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting product.' });
      }
      res.json({ message: 'Product deleted successfully.' });
    });
  });
};

exports.searchProducts = (req, res) => {
  const filters = {
    keyword: req.query.keyword,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
    isFree: req.query.isFree !== undefined ? req.query.isFree === 'true' : undefined,
    isOpenToTrade: req.query.isOpenToTrade !== undefined ? req.query.isOpenToTrade === 'true' : undefined,
  };

  Product.search(filters, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching products.' });
    }
    res.json({ products: products.map(withImages) });
  });
};

exports.getMyProducts = (req, res) => {
  Product.getBySellerId(req.user.id, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching products.' });
    }
    res.json({ products: products.map(withImages) });
  });
};
