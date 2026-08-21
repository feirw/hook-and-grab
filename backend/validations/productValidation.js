const Validator = require('validator');
const isEmpty = require('is-empty');

function validateProductListing(data) {
  const errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.price = !isEmpty(data.price) ? String(data.price) : '';

  if (Validator.isEmpty(data.title)) {
    errors.title = 'Title is required';
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description is required';
  }

  if (!Validator.isEmpty(data.price) && !Validator.isNumeric(data.price)) {
    errors.price = 'Price must be a number';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

module.exports = { validateProductListing };
