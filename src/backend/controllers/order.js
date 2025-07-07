const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.nama,
      price: item.menuItem.harga,
      quantity: item.quantity,
      addons: item.addons,
      totalPrice: item.totalPrice
    }));

    // Calculate total amount
    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create the order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      status: 'pending',
      deliveryAddress: deliveryAddress || '',
      notes: notes || ''
    });

    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for a user (with pagination)
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find({ user: req.user.id })
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.menuItem');

    const totalCount = await Order.countDocuments({ user: req.user.id });
    const hasMore = page * limit < totalCount;

    res.json({
      orders,
      hasMore
    });
  } catch (err) {
    console.error('Error getting orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error getting order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order can only be cancelled when pending' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
