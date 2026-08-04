const router = require('express').Router();
const {
  getProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  toggleWishlist, getWishlist, getAllUsers
} = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/profile',                    protect, getProfile);
router.put('/profile',                    protect, updateProfile);
router.post('/address',                   protect, addAddress);
router.put('/address/:addressId',         protect, updateAddress);
router.delete('/address/:addressId',      protect, deleteAddress);
router.get('/wishlist',                   protect, getWishlist);
router.post('/wishlist/:productId',       protect, toggleWishlist);

// Admin
router.get('/',                           protect, adminOnly, getAllUsers);

module.exports = router;
