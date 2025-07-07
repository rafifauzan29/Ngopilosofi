const Favorite = require('../models/Favorite');

const getUserFavorites = async (userId) => {
  const favorites = await Favorite.find({ user: userId }).populate('menuItem');
  return favorites.map(fav => fav.menuItem);
};

const toggleFavorite = async (userId, menuId) => {
  const existing = await Favorite.findOne({ user: userId, menuItem: menuId });

  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return { action: 'removed' };
  } else {
    const newFavorite = new Favorite({ user: userId, menuItem: menuId });
    await newFavorite.save();
    return { action: 'added' };
  }
};

const checkIsFavorite = async (userId, menuId) => {
  const count = await Favorite.countDocuments({ user: userId, menuItem: menuId });
  return count > 0;
};

module.exports = {
  getUserFavorites,
  toggleFavorite,
  checkIsFavorite
};