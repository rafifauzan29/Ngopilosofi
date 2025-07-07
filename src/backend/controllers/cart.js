const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.menuItem');

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    cart.items = cart.items.filter(item => item.menuItem);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, addons } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    let addonsDetail = [];
    if (
      addons &&
      Array.isArray(addons) &&
      Array.isArray(menuItem.tambahan)
    ) {
      addonsDetail = menuItem.tambahan
        .filter(addon => addons.includes(addon._id?.toString()))
        .map(addon => ({
          nama: addon.nama,
          harga: addon.harga,
        }));
    }

    const totalAddonPrice = addonsDetail.reduce((sum, a) => sum + a.harga, 0);
    const totalPrice = (menuItem.harga + totalAddonPrice) * quantity;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(item =>
      item.menuItem.toString() === menuItemId &&
      JSON.stringify(item.addons.map(a => a.nama).sort()) ===
      JSON.stringify(addonsDetail.map(a => a.nama).sort())
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice += totalPrice;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        quantity,
        addons: addonsDetail,
        totalPrice,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity, addons } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const menuItem = await MenuItem.findById(cart.items[itemIndex].menuItem);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    let addonsDetail = [];
    if (
      addons &&
      Array.isArray(addons) &&
      Array.isArray(menuItem.tambahan)
    ) {
      addonsDetail = menuItem.tambahan
        .filter(addon => addons.includes(addon._id?.toString()))
        .map(addon => ({
          nama: addon.nama,
          harga: addon.harga,
        }));
    }

    const totalAddonPrice = addonsDetail.reduce((sum, a) => sum + a.harga, 0);
    const totalPrice = (menuItem.harga + totalAddonPrice) * quantity;

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].addons = addonsDetail;
    cart.items[itemIndex].totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkDeleteCartItems = async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'itemIds harus berupa array' });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart tidak ditemukan' });
    }

    cart.items = cart.items.filter(
      item => !itemIds.includes(item._id.toString())
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } },
      { new: true }
    );

    res.json(cart || { items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart tidak ditemukan' });
    }

    const itemId = req.params.itemId;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Error in removeCartItem:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkout = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.nama,
      price: item.menuItem.harga,
      quantity: item.quantity,
      addons: item.addons,
      totalPrice: item.totalPrice
    }));

    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

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

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  bulkDeleteCartItems,
  clearCart,
  checkout
};
