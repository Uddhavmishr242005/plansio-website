const router = require('express').Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/payment.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/create-order',  optionalAuth, createRazorpayOrder);
router.post('/verify',        optionalAuth, verifyPayment);

module.exports = router;
