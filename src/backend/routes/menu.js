const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu');

router.get('/', menuController.getAllMenuItems);

router.get('/category/:category', menuController.getMenuItemsByCategory);

router.patch('/favorite/:id', menuController.toggleFavorite);

router.post('/', menuController.addMenuItem);

module.exports = router;