const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order.model');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ── Create Razorpay Order ─────────────────────
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const rpOrder = await razorpay.orders.create({
      amount:   Math.round(order.pricing.total * 100),
      currency: 'INR',
      receipt:  order.orderId,
      notes:    { orderId: order.orderId }
    });

    await Order.findByIdAndUpdate(order._id, {
      'payment.razorpayOrderId': rpOrder.id
    });

    res.json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount:          rpOrder.amount,
      currency:        rpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify Payment (Webhook) ──────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findOneAndUpdate(
      { 'payment.razorpayOrderId': razorpay_order_id },
      {
        'payment.status':           'paid',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.paidAt':            new Date(),
        status:                      'Confirmed',
        $push: { timeline: { status: 'Confirmed', message: 'Payment successful' } }
      },
      { new: true }
    );

    res.json({ success: true, message: 'Payment verified', orderId: order?.orderId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
