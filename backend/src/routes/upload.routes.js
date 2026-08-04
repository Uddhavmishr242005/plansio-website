const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { uploadProductImage, uploadVideo, deleteMedia, uploadHeroImage } = require('../controllers/upload.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Multer config - temp disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const imageFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'), false);
};

const videoFilter = (req, file, cb) => {
  file.mimetype.startsWith('video/') ? cb(null, true) : cb(new Error('Videos only'), false);
};

const uploadImg = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadVid = multer({ storage, fileFilter: videoFilter, limits: { fileSize: 200 * 1024 * 1024 } });

router.post('/image',       protect, adminOnly, uploadImg.single('image'),  uploadProductImage);
router.post('/video',       protect, adminOnly, uploadVid.single('video'),  uploadVideo);
router.post('/hero-image',  protect, adminOnly, uploadImg.single('image'),  uploadHeroImage);
router.delete('/',          protect, adminOnly, deleteMedia);

module.exports = router;
