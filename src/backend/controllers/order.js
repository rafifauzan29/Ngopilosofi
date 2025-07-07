const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Membuat order baru dari cart
const createOrder = async (req, res) => {
  try {
    const { paymentMethod, notes } = req.body;

    // Dapatkan cart user
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja kosong' });
    }

    // Hitung total harga
    const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Siapkan items untuk order
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      quantity: item.quantity,
      price: item.totalPrice,
      addons: item.addons,
      specialRequest: item.specialRequest || ''
    }));

    // Buat order baru (langsung selesai dan dibayar untuk demo)
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      paymentMethod,
      notes: notes || '',
      status: 'completed',         // langsung selesai
      paymentStatus: 'paid'        // langsung dianggap dibayar
    });

    // Simpan order
    await order.save();

    // Kosongkan cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } }
    );

    res.status(201).json(order);

  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mendapatkan semua order user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem');

    res.json(orders);
  } catch (err) {
    console.error('Error getting user orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mendapatkan detail order
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error getting order details:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Membatalkan order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Order tidak bisa dibatalkan karena sudah diproses' 
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Menambahkan ulasan ke order
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Hanya bisa memberikan ulasan untuk order yang sudah selesai' 
      });
    }

    if (order.review) {
      return res.status(400).json({ 
        message: 'Order ini sudah memiliki ulasan' 
      });
    }

    order.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Mendapatkan semua order
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.menuItem');

    res.json(orders);
  } catch (err) {
    console.error('Error getting all orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update status order
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  addReview,
  getAllOrders,
  updateOrderStatus
};
