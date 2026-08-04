const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/product.controller');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware');

router.get('/',           getProducts);
router.get('/:id',        getProduct);
router.post('/',          protect, adminOnly, createProduct);
router.put('/:id',        protect, adminOnly, updateProduct);
router.delete('/:id',     protect, adminOnly, deleteProduct);
router.post('/:id/review',protect, addReview);

module.exports = router;
