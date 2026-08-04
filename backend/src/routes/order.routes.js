const router = require('express').Router();
const {
  placeOrder, getUserOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus, getDashboardStats
} = require('../controllers/order.controller');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware');

// Customer routes
router.post('/',              optionalAuth, placeOrder);
router.get('/my',             protect, getUserOrders);
router.get('/:id',            protect, getOrder);
router.put('/:id/cancel',     protect, cancelOrder);

// Admin routes
router.get('/',               protect, adminOnly, getAllOrders);
router.put('/:id/status',     protect, adminOnly, updateOrderStatus);
router.get('/admin/stats',    protect, adminOnly, getDashboardStats);

module.exports = router;
