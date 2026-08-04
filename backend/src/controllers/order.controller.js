const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Cart = require('../models/Cart.model');

// ── Place Order ───────────────────────────────
exports.placeOrder = async (req, res) => {
  try {
    const { items, address, payment, coupon, notes, guestInfo } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items in order' });
    if (!address) return res.status(400).json({ success: false, message: 'Delivery address required' });

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}` });
      }
      const price = product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name:  product.title,
        image: product.images?.[0]?.url || '',
        price,
        quantity: item.quantity,
        variant:  item.variant || ''
      });
      // Reduce stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const discount = 0; // TODO: coupon logic
    const delivery = subtotal >= 499 ? 0 : 50;
    const total = subtotal - discount + delivery;

    const order = await Order.create({
      user:      req.user?._id,
      guestInfo: !req.user ? guestInfo : undefined,
      items:     orderItems,
      address,
      pricing:   { subtotal, discount, delivery, total },
      payment:   { method: payment?.method || 'COD' },
      coupon,
      notes,
      timeline:  [{ status: 'Pending', message: 'Order placed successfully' }]
    });

    // Clear cart if user logged in
    if (req.user) await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        orderId:  order.orderId,
        _id:      order._id,
        total:    order.pricing.total,
        status:   order.status,
        payment:  order.payment.method
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get User Orders ───────────────────────────
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'title images');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Order ──────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    }).populate('items.product', 'title images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only owner or admin can view
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Cancel Order ──────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} status` });
    }

    order.status = 'Cancelled';
    order.cancelReason = req.body.reason || 'Customer cancelled';
    order.timeline.push({ status: 'Cancelled', message: order.cancelReason });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Get All Orders ─────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'guestInfo.phone': { $regex: search, $options: 'i' } },
      { 'address.name': { $regex: search, $options: 'i' } }
    ];

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name phone email'),
      Order.countDocuments(filter)
    ]);

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Update Order Status ────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message, trackingId, courier } = req.body;
    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderId: req.params.id }] },
      {
        status,
        $push: { timeline: { status, message: message || `Order ${status}` } },
        ...(trackingId && { 'tracking.trackingId': trackingId }),
        ...(courier && { 'tracking.courier': courier }),
        ...(status === 'Delivered' && { deliveredAt: new Date() })
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Dashboard Stats ────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, pending, shipped, delivered, cancelled, revenueData] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Shipped' }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders, pending, shipped, delivered, cancelled,
        revenue: revenueData[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
