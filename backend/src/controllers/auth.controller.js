const User = require('../models/User.model');
const { sendTokenResponse } = require('../utils/jwt.util');
const admin = require('../utils/firebase.util');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Send OTP ──────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ success: false, message: 'Phone or email required' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Find or create user
    let user = await User.findOne(phone ? { phone } : { email });
    if (!user) user = new User(phone ? { phone } : { email });
    user.otp = { code: otp, expiry };
    await user.save();

    // TODO: Send OTP via Twilio/Firebase
    // For now: log to console (replace with SMS/email in production)
    console.log(`OTP for ${phone || email}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify OTP ────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });

    const user = await User.findOne(phone ? { phone } : { email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found. Please send OTP first.' });

    if (!user.otp?.code || user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (user.otp.expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Firebase Token Login (Google/Phone) ───────
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Firebase ID token required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number, email, name, picture } = decoded;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: phone_number,
        email,
        name,
        avatar: picture,
        isVerified: true
      });
    }
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Register with Email/Password ──────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email && !phone) return res.status(400).json({ success: false, message: 'Email or phone required' });

    const exists = await User.findOne(email ? { email } : { phone });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const user = await User.create({ name, email, phone, password });
    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login with Email/Password ─────────────────
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'Credentials required' });
    }

    const user = await User.findOne(email ? { email } : { phone }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Me ────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
