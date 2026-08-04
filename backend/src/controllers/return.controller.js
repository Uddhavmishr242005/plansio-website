const Return = require('../models/Return.model');
const Order  = require('../models/Order.model');
const Product = require('../models/Product.model');
const { uploadImage, uploadVideo } = require('../utils/cloudinary.util');
const fs = require('fs');

// ── Request Return ────────────────────────────
exports.requestReturn = async (req, res) => {
  try {
    const { orderId, items, reason, description, refundMethod, upiId, bankAccount } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId }],
      user: req.user._id,
      status: 'Delivered'
    });
    if (!order) return res.status(404).json({ success: false, message: 'Delivered order not found' });

    // Check 7-day return window
    const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7)
      return res.status(400).json({ success: false, message: 'Return window expired (7 days)' });

    // Upload proof images/videos
    const images = [], videos = [];
    if (req.files?.images) {
      for (const f of req.files.images) {
        const r = await uploadImage(f.path, 'plansio/returns');
        images.push({ url: r.url, publicId: r.publicId });
        fs.unlink(f.path, () => {});
      }
    }
    if (req.files?.videos) {
      for (const f of req.files.videos) {
        const r = await uploadVideo(f.path, 'plansio/returns');
        videos.push({ url: r.url, publicId: r.publicId });
        fs.unlink(f.path, () => {});
      }
    }

    // Calculate refund amount
    const refundAmount = items
      ? items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      : order.pricing.total;

    const ret = await Return.create({
      order:   order._id,
      user:    req.user._id,
      items:   items || order.items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price })),
      reason, description, images, videos,
      refund: {
        amount: refundAmount,
        method: refundMethod || (order.payment.method === 'COD' ? 'bank' : 'original'),
        upiId,
        bankAccount
      },
      timeline: [{ status: 'Requested', message: 'Return request submitted' }]
    });

    // Update order status
    await Order.findByIdAndUpdate(order._id, {
      $push: { timeline: { status: 'ReturnRequested', message: 'Return requested by customer' } }
    });

    res.status(201).json({ success: true, message: 'Return request submitted', returnId: ret.returnId, return: ret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get User Returns ──────────────────────────
exports.getUserReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('order', 'orderId')
      .populate('items.product', 'title images');
    res.json({ success: true, returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Get All Returns ────────────────────
exports.getAllReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [returns, total] = await Promise.all([
      Return.find(filter).sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit))
        .populate('user', 'name phone email')
        .populate('order', 'orderId'),
      Return.countDocuments(filter)
    ]);
    res.json({ success: true, returns, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Update Return Status ───────────────
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status, message, awbNumber, courier, adminNote } = req.body;
    const ret = await Return.findById(req.params.id);
    if (!ret) return res.status(404).json({ success: false, message: 'Return not found' });

    ret.status = status;
    ret.timeline.push({ status, message: message || `Return ${status}` });
    if (adminNote) ret.adminNote = adminNote;

    if (status === 'PickupScheduled' && awbNumber) {
      ret.pickup = { awbNumber, courier, scheduledAt: new Date() };
    }
    if (status === 'PickupCompleted') {
      ret.pickup.completedAt = new Date();
      // Restore stock
      for (const item of ret.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      // Trigger refund
      ret.refund.status = 'processing';
      ret.timeline.push({ status: 'RefundInitiated', message: `Refund of ₹${ret.refund.amount} initiated` });
    }
    if (status === 'Refunded') {
      ret.refund.status = 'completed';
      ret.refund.processedAt = new Date();
      ret.refund.transactionId = req.body.transactionId;
    }
    await ret.save();
    res.json({ success: true, return: ret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
