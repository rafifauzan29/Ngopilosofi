const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');

router.put('/updateProfile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      name,
      email,
      avatar
    }, { new: true });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Gagal update profil' });
  }
});

module.exports = router;
