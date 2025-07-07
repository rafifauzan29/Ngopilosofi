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


router.post('/', auth, createOrder);

router.get('/', auth, getOrders);

router.get('/:id', auth, getOrderById);

router.put('/:id/status', auth, updateOrderStatus);

router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;