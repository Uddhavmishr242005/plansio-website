const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const { requestReturn, getUserReturns, getAllReturns, updateReturnStatus } = require('../controllers/return.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const fields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

router.post('/',           protect, fields, requestReturn);
router.get('/my',          protect, getUserReturns);
router.get('/',            protect, adminOnly, getAllReturns);
router.put('/:id/status',  protect, adminOnly, updateReturnStatus);

module.exports = router;
