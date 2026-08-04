const User = require('../models/User.model');
const Cart = require('../models/Cart.model');
const { sendTokenResponse } = require('../utils/jwt.util');
const { generateOTP, sendOTPSMS, sendOTPEmail } = require('../utils/otp.util');
const admin = require('../utils/firebase.util');

// ── Send OTP ──────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ success: false, message: 'Phone or email required' });

    const otp  = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne(phone ? { phone } : { email });
    if (!user) user = new User(phone ? { phone } : { email });
    user.otp = { code: otp, expiry };
    await user.save();

    let result;
    if (phone) result = await sendOTPSMS(phone, otp);
    else       result = await sendOTPEmail(email, otp);

    res.json({ success: true, message: `OTP sent via ${result.method}`, isNew: !user.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify OTP + Merge Guest Cart ─────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, email, otp, sessionId } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });

    const user = await User.findOne(phone ? { phone } : { email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp?.code || user.otp.code !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otp.expiry < new Date())
      return res.status(400).json({ success: false, message: 'OTP expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Merge guest cart → user cart
    if (sessionId) {
      const guestCart = await Cart.findOne({ sessionId });
      if (guestCart && guestCart.items.length) {
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          guestCart.user = user._id;
          guestCart.sessionId = undefined;
          await guestCart.save();
        } else {
          for (const item of guestCart.items) {
            const idx = userCart.items.findIndex(i => i.product.toString() === item.product.toString());
            if (idx > -1) userCart.items[idx].quantity += item.quantity;
            else userCart.items.push(item);
          }
          await userCart.save();
          await Cart.findByIdAndDelete(guestCart._id);
        }
      }
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Firebase Token Login ───────────────────────
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken, sessionId } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number, email, name, picture } = decoded;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({ firebaseUid: uid, phone: phone_number, email, name, avatar: picture, isVerified: true });
    }
    user.lastLogin = new Date();
    await user.save();

    // Merge guest cart
    if (sessionId) {
      const guestCart = await Cart.findOne({ sessionId });
      if (guestCart?.items.length) {
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) { guestCart.user = user._id; guestCart.sessionId = undefined; await guestCart.save(); }
        else {
          for (const item of guestCart.items) {
            const idx = userCart.items.findIndex(i => i.product.toString() === item.product.toString());
            if (idx > -1) userCart.items[idx].quantity += item.quantity;
            else userCart.items.push(item);
          }
          await userCart.save();
          await Cart.findByIdAndDelete(guestCart._id);
        }
      }
    }
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Register ──────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await User.findOne(email ? { email } : { phone });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
    const user = await User.create({ name, email, phone, password });
    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login ─────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findOne(email ? { email } : { phone }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Me ────────────────────────────────────
exports.getMe = async (req, res) => res.json({ success: true, user: req.user });
