const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

function encodeImage(imagePath) {
  if (!imagePath) return null;
  const absolutePath = path.join(__dirname, '..', imagePath);
  try {
    const imageData = fs.readFileSync(absolutePath);
    const mimeType = mime.lookup(absolutePath) || 'application/octet-stream';
    return {
      filename: path.basename(imagePath),
      data: imageData.toString('base64'),
      mimeType,
    };
  } catch (err) {
    console.error('Error reading image:', err.message);
    return null;
  }
}

function encodeImages(imagesField) {
  if (!imagesField) return [];
  return String(imagesField)
    .split(';')
    .map((imagePath) => imagePath.trim())
    .filter(Boolean)
    .map(encodeImage)
    .filter(Boolean);
}

function toBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

module.exports = { encodeImage, encodeImages, toBoolean };
