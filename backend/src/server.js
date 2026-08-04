const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'https://plansio-website.up.railway.app'
  ],
  credentials: true
}));

// ── Rate Limiting ──
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/v1/auth',     require('./routes/auth.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/orders',   require('./routes/order.routes'));
app.use('/api/v1/users',    require('./routes/user.routes'));
app.use('/api/v1/cart',     require('./routes/cart.routes'));
app.use('/api/v1/upload',   require('./routes/upload.routes'));
app.use('/api/v1/payment',  require('./routes/payment.routes'));
app.use('/api/v1/returns',  require('./routes/return.routes'));
app.use('/api/v1/reviews',  require('./routes/review.routes'));
app.use('/api/v1/pincode',  require('./routes/pincode.routes'));
app.use('/api/v1/admin',    require('./routes/admin.routes'));

// ── Health Check ──
app.get('/', (req, res) => res.json({
  status: 'PLANSIO API Running ✅',
  version: '2.0.0',
  endpoints: [
    'POST /api/v1/auth/send-otp',
    'POST /api/v1/auth/verify-otp',
    'GET  /api/v1/products',
    'POST /api/v1/orders',
    'POST /api/v1/returns',
    'GET  /api/v1/pincode/check/:pincode',
    'POST /api/v1/reviews/:productId',
    'GET  /api/v1/admin/dashboard'
  ]
}));

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// ── MongoDB + Start ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 PLANSIO API running on port ${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}`);
    });
  })
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });
