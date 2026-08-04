const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const { submitReview, approveReview, getReviews } = require('../controllers/review.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
const fields = upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]);

router.get('/:id',                           getReviews);
router.post('/:id',                          protect, fields, submitReview);
router.put('/:productId/:reviewId/approve',  protect, adminOnly, approveReview);

module.exports = router;
