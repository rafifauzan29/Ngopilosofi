const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  nama: String,
  harga: Number
});

const menuItemSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true
  },
  harga: {
    type: Number,
    required: true
  },
  gambar: String,
  kategori: [String],
  favorite: {
    type: Boolean,
    default: false
  },
  deskripsi: String,
  tambahan: [addonSchema]
});

module.exports = mongoose.model('MenuItem', menuItemSchema);