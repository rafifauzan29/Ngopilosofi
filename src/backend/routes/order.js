const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order');
const auth = require('../middleware/auth');


router.post('/', auth, OrderController.createOrder);
router.get('/', auth, OrderController.getUserOrders);
router.get('/:id', auth, OrderController.getOrderDetail);
router.put('/:id/cancel', auth, OrderController.cancelOrder);
router.post('/:id/review', auth, OrderController.addReview);

module.exports = router;