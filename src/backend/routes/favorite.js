const express = require('express');
const authMiddleware = require('../middleware/auth');
const favoriteController = require('../controllers/favorite');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await favoriteController.getUserFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:menuId', authMiddleware, async (req, res) => {
  try {
    const result = await favoriteController.toggleFavorite(req.user.id, req.params.menuId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/check/:menuId', authMiddleware, async (req, res) => {
  try {
    const isFavorite = await favoriteController.checkIsFavorite(req.user.id, req.params.menuId);
    res.json({ isFavorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;