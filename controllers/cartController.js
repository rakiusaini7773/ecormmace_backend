const Cart = require('../models/Cart');

// 🛒 GET: Get current cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.sessionID }).populate('items.productId');
    res.status(200).json(cart || { sessionId: req.sessionID, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error getting cart', error: err.message });
  }
};

// ➕ POST: Add product to cart
exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  try {
    let cart = await Cart.findOne({ sessionId: req.sessionID });

    if (!cart) {
      cart = new Cart({
        sessionId: req.sessionID,
        items: [{ productId, quantity: 1 }]
      });
    } else {
      const item = cart.items.find(i => i.productId.toString() === productId);
      if (item) {
        item.quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// 🔼 POST: Increment quantity
exports.incrementQuantity = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ sessionId: req.sessionID });

    const item = cart?.items.find(i => i.productId.toString() === productId);
    if (item) {
      item.quantity += 1;
      await cart.save();
      await cart.populate('items.productId');
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error incrementing quantity', error: err.message });
  }
};

// 🔽 POST: Decrement quantity
exports.decrementQuantity = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ sessionId: req.sessionID });

    const item = cart?.items.find(i => i.productId.toString() === productId);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
      }
      await cart.save();
      await cart.populate('items.productId');
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error decrementing quantity', error: err.message });
  }
};

// ❌ DELETE: Remove item
exports.removeItem = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ sessionId: req.sessionID });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
};

// 🧹 DELETE: Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { sessionId: req.sessionID },
      { $set: { items: [] } },
      { new: true }
    );
    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};
