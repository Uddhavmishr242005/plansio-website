const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Homepage = require('../models/Homepage.model');

// All admin routes protected
router.use(protect, adminOnly);

// ── Dashboard Stats ──
router.get('/dashboard', async (req, res) => {
  try {
    const [products, orders, users, pendingOrders, revenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name phone');

    res.json({
      success: true,
      stats: {
        products, orders, users, pendingOrders,
        revenue: revenue[0]?.total || 0
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Homepage Config ──
router.get('/homepage', async (req, res) => {
  try {
    let hp = await Homepage.findOne({ key: 'main' });
    if (!hp) hp = await Homepage.create({ key: 'main' });
    res.json({ success: true, homepage: hp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/homepage', async (req, res) => {
  try {
    const hp = await Homepage.findOneAndUpdate(
      { key: 'main' },
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ success: true, homepage: hp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Approve/Reject Reviews ──
router.put('/reviews/:productId/:reviewId', async (req, res) => {
  try {
    const { approved } = req.body;
    await Product.updateOne(
      { _id: req.params.productId, 'reviews._id': req.params.reviewId },
      { $set: { 'reviews.$.approved': approved } }
    );
    res.json({ success: true, message: `Review ${approved ? 'approved' : 'rejected'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
