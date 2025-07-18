const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/verify', authController.verifyToken);

module.exports = router;
