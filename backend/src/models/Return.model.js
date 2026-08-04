const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  order:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  returnId:    { type: String, unique: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    quantity: Number,
    price:    Number,
    reason:   String
  }],
  reason:      { type: String, required: true },
  description: String,
  images:      [{ url: String, publicId: String }],
  videos:      [{ url: String, publicId: String }],
  status: {
    type: String,
    enum: ['Requested','Approved','Rejected','PickupScheduled','PickupCompleted','Refunded'],
    default: 'Requested'
  },
  refund: {
    amount:    Number,
    method:    String,
    status:    { type: String, enum: ['pending','processing','completed'], default: 'pending' },
    upiId:     String,
    bankAccount: String,
    transactionId: String,
    processedAt:   Date
  },
  pickup: {
    awbNumber:   String,
    courier:     String,
    scheduledAt: Date,
    completedAt: Date
  },
  timeline: [{
    status:  String,
    message: String,
    time:    { type: Date, default: Date.now }
  }],
  adminNote: String,
  requestedAt: { type: Date, default: Date.now }
}, { timestamps: true });

returnSchema.pre('save', function(next) {
  if (!this.returnId) {
    this.returnId = 'RET-' + Date.now().toString().slice(-7);
  }
  next();
});

module.exports = mongoose.model('Return', returnSchema);
