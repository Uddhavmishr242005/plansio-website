const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// ── Rate Limiting ──
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

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
app.use('/api/v1/admin',    require('./routes/admin.routes'));

// ── Health Check ──
app.get('/', (req, res) => res.json({ status: 'PLANSIO API Running ✅', version: '1.0.0' }));

// ── 404 Handler ──
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB Error:', err); process.exit(1); });
