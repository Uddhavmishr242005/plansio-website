const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  name:     String,
  phone:    String,
  line1:    String,
  line2:    String,
  city:     String,
  state:    String,
  pincode:  String,
  isDefault:{ type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name:       { type: String, trim: true },
  email:      { type: String, lowercase: true, trim: true, sparse: true },
  phone:      { type: String, trim: true, sparse: true },
  password:   { type: String, select: false },
  role:       { type: String, enum: ['customer','admin','vendor','support'], default: 'customer' },
  avatar:     { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  firebaseUid:{ type: String, sparse: true },
  addresses:  [addressSchema],
  wishlist:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive:   { type: Boolean, default: true },
  lastLogin:  Date,
  otp:        { code: String, expiry: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
