const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/order');

// Create a new order
router.post('/', auth, createOrder);

// Get all orders for a user
router.get('/', auth, getOrders);

// Get a specific order
router.get('/:id', auth, getOrderById);

// Update order status (admin only)
router.put('/:id/status', auth, updateOrderStatus);

// Cancel an order
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;