const MenuItem = require('../models/MenuItem');

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const menuItems = await MenuItem.find({ kategori: category });
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menuItem.favorite = !menuItem.favorite;
    const updatedItem = await menuItem.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMenuItem = async (req, res) => {
  const menuItem = new MenuItem({
    nama: req.body.nama,
    harga: req.body.harga,
    gambar: req.body.gambar,
    kategori: req.body.kategori,
    deskripsi: req.body.deskripsi,
    tambahan: req.body.tambahan
  });

  try {
    const newMenuItem = await menuItem.save();
    res.status(201).json(newMenuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};