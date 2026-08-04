const router = require('express').Router();
const Cart = require('../models/Cart.model');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Get cart
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter).populate('items.product', 'title price images stock');
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Add to cart
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    let cart = await Cart.findOne(filter) || new Cart({ ...filter });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, quantity, variant });
    await cart.save();
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Remove from cart
router.delete('/remove/:productId', optionalAuth, async (req, res) => {
  try {
    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    await Cart.findOneAndUpdate(filter, { $pull: { items: { product: req.params.productId } } });
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Clear cart
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    await Cart.findOneAndDelete(filter);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
