const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
  sessionId: { type: String, sparse: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    image:    String,
    price:    Number,
    quantity: { type: Number, default: 1 },
    variant:  String
  }],
  coupon:    String,
  discount:  { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
