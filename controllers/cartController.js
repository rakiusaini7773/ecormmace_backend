const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ productId, quantity: 1 }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
      await cart.save();
    }

    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
};

exports.incrementQuantity = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not found in cart" });

    item.quantity += 1;
    await cart.save();
    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error incrementing quantity", error });
  }
};

exports.decrementQuantity = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not found in cart" });

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    }

    await cart.save();
    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error decrementing quantity", error });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate('items.productId');

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};
