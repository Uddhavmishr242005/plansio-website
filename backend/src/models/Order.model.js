const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      String,
  image:     String,
  price:     Number,
  quantity:  { type: Number, default: 1 },
  variant:   String
});

const orderSchema = new mongoose.Schema({
  orderId:   { type: String, unique: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: { name: String, phone: String, email: String },
  items:     [orderItemSchema],
  address: {
    name:    String,
    phone:   String,
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String
  },
  pricing: {
    subtotal:  Number,
    discount:  { type: Number, default: 0 },
    delivery:  { type: Number, default: 0 },
    tax:       { type: Number, default: 0 },
    total:     Number
  },
  payment: {
    method:        { type: String, enum: ['COD','UPI','Card','NetBanking','Wallet'], default: 'COD' },
    status:        { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    razorpayOrderId:  String,
    razorpayPaymentId: String,
    paidAt:        Date
  },
  status: {
    type: String,
    enum: ['Pending','Confirmed','Processing','Shipped','OutForDelivery','Delivered','Cancelled','Returned'],
    default: 'Pending'
  },
  timeline: [{
    status:  String,
    message: String,
    time:    { type: Date, default: Date.now }
  }],
  tracking: {
    courier:    String,
    trackingId: String,
    trackingUrl:String
  },
  coupon:  String,
  notes:   String,
  invoice: String,
  cancelReason: String,
  deliveredAt: Date
}, { timestamps: true });

// Auto generate orderId
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'PL-' + Date.now().toString().slice(-7) + Math.random().toString(36).slice(-3).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
